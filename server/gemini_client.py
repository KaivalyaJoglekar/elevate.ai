from __future__ import annotations

import asyncio
import json
import time
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types

from config import get_settings

load_dotenv()

settings = get_settings()
client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None


def _parse_json(text: str) -> dict[str, Any]:
    start = text.find('{')
    end = text.rfind('}') + 1
    if start == -1 or end <= 0:
        raise ValueError('No valid JSON object found in model response.')
    return json.loads(text[start:end])


def _should_retry(exc: Exception) -> bool:
    message = str(exc)
    retry_markers = (
        '503',
        'UNAVAILABLE',
        '429',
        'RESOURCE_EXHAUSTED',
        'high demand',
        'try again later',
    )
    return any(marker.lower() in message.lower() for marker in retry_markers)


def _candidate_models() -> list[str]:
    models = [settings.gemini_model, *settings.gemini_fallback_models]
    deduped: list[str] = []
    for model in models:
        if model and model not in deduped:
            deduped.append(model)
    return deduped


def _generate_json(prompt: str) -> dict[str, Any]:
    if not client:
        raise RuntimeError('GEMINI_API_KEY is not configured.')

    last_error: Exception | None = None
    models = _candidate_models()

    for model_index, model_name in enumerate(models):
        for attempt in range(settings.gemini_max_retries):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type='application/json'),
                )
                return _parse_json(response.text)
            except Exception as exc:
                last_error = exc
                is_last_attempt = attempt == settings.gemini_max_retries - 1
                has_fallback_model = model_index < len(models) - 1
                if not _should_retry(exc) and not has_fallback_model:
                    raise
                if not is_last_attempt:
                    time.sleep(settings.gemini_retry_backoff_seconds * (attempt + 1))
                    continue
                break

    raise RuntimeError(f'Gemini request failed after retries and fallbacks: {last_error}')


def generate_resume_extraction(*, resume_text: str, job_description: str, target_role: str, weak_bullets: list[str]) -> dict[str, Any]:
    effective_job_description = job_description.strip() or f'No job description was provided. Use the target role "{target_role}" as the evaluation anchor.'
    prompt = f"""
Return valid JSON only.

You are analyzing a resume for the role "{target_role}".
Use only the resume text and the job description. Do not invent facts.

Return:
{{
  "missing_skills": ["string"],
  "strengths": ["string"],
  "weak_bullets": ["string"]
}}

Resume:
{resume_text[:12000]}

Job Description:
{effective_job_description[:6000]}

Candidate weak bullets detected by rules:
{json.dumps(weak_bullets)}
""".strip()

    result = _generate_json(prompt)
    return {
        'missing_skills': result.get('missing_skills', [])[:12],
        'strengths': result.get('strengths', [])[:8],
        'weak_bullets': result.get('weak_bullets', weak_bullets)[:5],
    }


def generate_resume_rewrites(*, resume_text: str, weak_bullets: list[str], target_role: str, job_description: str) -> list[dict[str, str]]:
    if not weak_bullets:
        return []
    effective_job_description = job_description.strip() or f'No job description was provided. Tailor the rewrite generally for the target role "{target_role}".'
    prompt = f"""
Return valid JSON only.

Rewrite each weak resume bullet into an ATS-friendly XYZ-style bullet for the role "{target_role}".
Use only information implied by the original bullet and the resume. Do not fabricate metrics.

Return:
{{
  "rewrites": [
    {{
      "original": "string",
      "rewritten": "string"
    }}
  ]
}}

Resume:
{resume_text[:12000]}

Job Description:
{effective_job_description[:6000]}

Weak bullets:
{json.dumps(weak_bullets)}
""".strip()
    result = _generate_json(prompt)
    rewrites = result.get('rewrites', [])
    normalized: list[dict[str, str]] = []
    for item in rewrites[:5]:
        original = str(item.get('original', '')).strip()
        rewritten = str(item.get('rewritten', '')).strip()
        if original and rewritten:
            normalized.append({'original': original, 'rewritten': rewritten})
    return normalized


async def get_dual_analysis(prompt: str) -> dict[str, Any]:
    return await asyncio.to_thread(_generate_json, prompt)
