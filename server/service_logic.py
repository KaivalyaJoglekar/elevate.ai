import asyncio
import base64
from datetime import datetime, timezone
import re
import time
from typing import Any

from fastapi import HTTPException

from api_clients import fetch_fulltime_jobs_from_jsearch, fetch_internships_from_jsearch
from career_mapper import adapt_jsearch_to_career_path
from config import get_settings
from resume_pipeline import compute_ats_evaluation
from resume_pipeline import count_meaningful_words, validate_resume_text_quality
from utils import build_dual_analysis_prompt, parse_pdf_text

SOFT_SKILL_QUERY_BLOCKLIST = {
    'adaptability',
    'attention to detail',
    'collaboration',
    'communication',
    'critical thinking',
    'customer service',
    'leadership',
    'mentoring',
    'multitasking',
    'ownership',
    'presentation',
    'problem solving',
    'problem-solving',
    'stakeholder management',
    'team management',
    'team player',
    'teamwork',
    'time management',
}

GENERIC_QUERY_STOPWORDS = {
    'a', 'an', 'and', 'for', 'from', 'in', 'into', 'level', 'looking', 'of',
    'on', 'or', 'role', 'roles', 'the', 'to', 'with', 'years', 'year',
}


async def run_dual_resume_analysis(file_content: str) -> dict:
    try:
        padded_content = file_content
        missing_padding = len(padded_content) % 4
        if missing_padding:
            padded_content += '=' * (4 - missing_padding)

        pdf_bytes = base64.b64decode(padded_content, validate=True)
        resume_text = await asyncio.to_thread(parse_pdf_text, pdf_bytes)
        if not resume_text.strip():
            raise ValueError("Parsed resume is empty.")
        validate_resume_text_quality(resume_text)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"File processing error: {exc}") from exc

    return await run_resume_review(
        resume_text=resume_text,
        target_role='Software Engineer',
        experience_level='Entry Level',
        job_description='',
        parsing_method='fitz',
    )


async def run_jobs_search(query: str, job_type: str, *, fallback_queries: list[str] | None = None) -> list:
    search_candidates = _unique_terms([
        query,
        *(fallback_queries or []),
        *_build_generic_search_fallbacks(query, job_type),
    ])

    for candidate in search_candidates:
        if job_type == 'full-time':
            jobs_data = await fetch_fulltime_jobs_from_jsearch(candidate)
        else:
            jobs_data = await fetch_internships_from_jsearch(candidate)

        if jobs_data:
            query_skills = candidate.split()
            return adapt_jsearch_to_career_path(jobs_data, job_type, query_skills)

    return []


def _normalize_skills(raw_items: Any) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    seen: set[str] = set()

    for item in raw_items or []:
        if isinstance(item, dict):
            name = str(item.get('name', '')).strip()
        else:
            name = str(item).strip()
        if not name:
            continue
        key = name.lower()
        if key in seen:
            continue
        seen.add(key)
        normalized.append({'name': name})

    return normalized[:14]


def _normalize_string_list(raw_items: Any, *, limit: int) -> list[str]:
    values: list[str] = []
    for item in raw_items or []:
        text = str(item).strip()
        if text:
            values.append(text)
    return values[:limit]


def _merge_unique_strings(primary: list[str], secondary: list[str], *, limit: int) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()
    for item in [*primary, *secondary]:
        value = item.strip()
        if not value:
            continue
        key = value.lower()
        if key in seen:
            continue
        seen.add(key)
        merged.append(value)
        if len(merged) >= limit:
            break
    return merged


def _market_context() -> dict[str, str]:
    settings = get_settings()
    return {
        'country_code': settings.market_country_code,
        'region_name': settings.market_region_name,
        'timezone': settings.market_timezone,
        'currency': settings.market_currency,
        'job_source': 'JSearch',
    }


def _normalize_section(section: Any, evaluation: dict[str, Any]) -> dict[str, Any]:
    data = section if isinstance(section, dict) else {}
    llm_improvements = _normalize_string_list(data.get('generalResumeImprovements'), limit=6)
    llm_upskilling = _normalize_string_list(data.get('generalUpskillingSuggestions'), limit=6)
    return {
        'name': str(data.get('name', 'Valued Professional')).strip() or 'Valued Professional',
        'summary': str(data.get('summary', 'No summary generated.')).strip() or 'No summary generated.',
        'atsScore': {
            'score': evaluation['ats_score'],
            'feedback': evaluation['feedback'],
            'breakdown': evaluation['score_breakdown'],
            'matchedKeywords': evaluation['matched_keywords'],
            'missingKeywords': evaluation['missing_keywords'],
            'topIssues': evaluation['improvements'],
        },
        'extractedSkills': _normalize_skills(data.get('extractedSkills')),
        'experienceSummary': _normalize_string_list(data.get('experienceSummary'), limit=8),
        'educationSummary': _normalize_string_list(data.get('educationSummary'), limit=6),
        'careerPaths': [],
        'generalResumeImprovements': _merge_unique_strings(evaluation['improvements'], llm_improvements, limit=7),
        'generalUpskillingSuggestions': _merge_unique_strings(llm_upskilling, evaluation['improvements'], limit=7),
    }


def _unique_terms(values: list[str]) -> list[str]:
    deduped: list[str] = []
    seen: set[str] = set()
    for value in values:
        normalized = re.sub(r'\s+', ' ', value).strip()
        if not normalized:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(normalized)
    return deduped


def _extract_context_terms(text: str, *, limit: int) -> list[str]:
    tokens = re.findall(r'[A-Za-z][A-Za-z0-9+.#/-]{1,}', text)
    filtered = [
        token
        for token in tokens
        if token.lower() not in GENERIC_QUERY_STOPWORDS
        and token.lower() not in SOFT_SKILL_QUERY_BLOCKLIST
    ]
    return _unique_terms(filtered)[:limit]


def _filter_search_skills(extracted_skills: list[dict[str, str]]) -> list[str]:
    filtered: list[str] = []
    seen: set[str] = set()

    for item in extracted_skills:
        name = str(item.get('name', '')).strip()
        if not name:
            continue
        key = name.lower()
        if key in SOFT_SKILL_QUERY_BLOCKLIST or key in seen:
            continue
        if not re.search(r'[A-Za-z0-9]', name):
            continue
        seen.add(key)
        filtered.append(name)

    return filtered[:6]


def _build_generic_search_fallbacks(query: str, job_type: str) -> list[str]:
    context_terms = _extract_context_terms(query, limit=4)
    fallbacks: list[str] = []

    if len(context_terms) >= 2:
        fallbacks.append(' '.join(context_terms[:3]))
        fallbacks.append(' '.join(context_terms[:2]))

    if job_type == 'internship':
        internship_base = ' '.join(context_terms[:2]) if context_terms else query
        if internship_base and 'intern' not in internship_base.lower():
            fallbacks.append(f'{internship_base} internship')

    return fallbacks


def _build_role_search_fallbacks(target_role: str, market_region: str, job_type: str) -> list[str]:
    role = target_role.strip() or 'Software Engineer'
    region = market_region.strip()
    fallbacks = [
        f'{role} {region}'.strip(),
        role,
    ]

    if job_type == 'internship':
        fallbacks.extend([
            f'{role} internship {region}'.strip(),
            f'{role} internship'.strip(),
        ])

    return fallbacks


def build_job_search_query(
    target_role: str,
    extracted_skills: list[dict[str, str]],
    fallback_text: str = '',
    *,
    market_region: str = 'India',
) -> str:
    top_skills = _filter_search_skills(extracted_skills)
    role = target_role.strip() or 'Software Engineer'
    role_terms = {token.lower() for token in re.findall(r'[A-Za-z][A-Za-z0-9+.#/-]{1,}', role)}
    fallback_tokens = [
        token
        for token in _extract_context_terms(fallback_text, limit=4)
        if token.lower() not in role_terms
    ][:2]
    terms = [role, *top_skills[:2], *fallback_tokens[:2]]
    query = ' '.join(_unique_terms(terms))
    region = market_region.strip()
    if region and region.lower() not in query.lower():
        query = f'{query} {region}'.strip()
    return query or role


async def _safe_job_search(query: str, job_type: str, *, fallback_queries: list[str] | None = None) -> tuple[list, str | None]:
    try:
        return await run_jobs_search(query, job_type, fallback_queries=fallback_queries), None
    except HTTPException as exc:
        return [], str(exc.detail)
    except Exception as exc:
        return [], str(exc)


async def run_resume_review(
    *,
    resume_text: str,
    target_role: str,
    experience_level: str,
    job_description: str,
    parsing_method: str,
) -> dict[str, Any]:
    from gemini_client import get_dual_analysis

    settings = get_settings()
    market_context = _market_context()
    analysis_started_at = time.perf_counter()
    generated_at_utc = datetime.now(timezone.utc).isoformat()

    prompt = build_dual_analysis_prompt(
        resume_content=resume_text,
        target_role=target_role,
        experience_level=experience_level,
        job_description=job_description,
        market_context=market_context,
    )
    llm_started_at = time.perf_counter()
    raw_result = await get_dual_analysis(prompt)
    llm_elapsed_ms = round((time.perf_counter() - llm_started_at) * 1000, 2)

    if not raw_result or 'full_time_analysis' not in raw_result or 'internship_analysis' not in raw_result:
        raise HTTPException(status_code=500, detail='AI analysis failed. Check service logs.')

    full_time_evaluation = compute_ats_evaluation(
        resume_text,
        job_description,
        target_role,
        parsing_method=parsing_method,
        scoring_mode='full-time',
    )
    internship_evaluation = compute_ats_evaluation(
        resume_text,
        job_description,
        target_role,
        parsing_method=parsing_method,
        scoring_mode='internship',
    )

    full_time_analysis = _normalize_section(raw_result.get('full_time_analysis'), full_time_evaluation)
    internship_analysis = _normalize_section(raw_result.get('internship_analysis'), internship_evaluation)

    full_time_query = build_job_search_query(
        target_role,
        full_time_analysis['extractedSkills'],
        job_description,
        market_region=settings.market_region_name,
    )
    internship_query = build_job_search_query(
        target_role,
        internship_analysis['extractedSkills'],
        job_description,
        market_region=settings.market_region_name,
    )

    market_started_at = time.perf_counter()
    (full_time_jobs, full_time_error), (internship_jobs, internship_error) = await asyncio.gather(
        _safe_job_search(
            full_time_query,
            'full-time',
            fallback_queries=_build_role_search_fallbacks(target_role, settings.market_region_name, 'full-time'),
        ),
        _safe_job_search(
            internship_query,
            'internship',
            fallback_queries=_build_role_search_fallbacks(target_role, settings.market_region_name, 'internship'),
        ),
    )
    market_elapsed_ms = round((time.perf_counter() - market_started_at) * 1000, 2)

    full_time_analysis['careerPaths'] = full_time_jobs
    internship_analysis['careerPaths'] = internship_jobs

    market_notes = []
    if full_time_error:
        market_notes.append(f'Full-time feed unavailable: {full_time_error}')
    if internship_error:
        market_notes.append(f'Internship feed unavailable: {internship_error}')
    if not market_notes:
        market_notes.append(f'Live {settings.market_region_name} job market feed updated successfully.')

    total_elapsed_ms = round((time.perf_counter() - analysis_started_at) * 1000, 2)
    return {
        'candidate_name': full_time_analysis['name'],
        'target_role': target_role,
        'experience_level': experience_level,
        'parsing_method': parsing_method,
        'resume_text_raw': resume_text,
        'job_description_raw': job_description,
        'resume_excerpt': resume_text[:1200],
        'job_description_excerpt': job_description[:500],
        'full_time_query': full_time_query,
        'internship_query': internship_query,
        'job_market_status': ' '.join(market_notes),
        'job_market_live': not full_time_error and not internship_error,
        'market_context': market_context,
        'analysis_metadata': {
            'backend_version': settings.app_version,
            'generated_at_utc': generated_at_utc,
            'timings_ms': {
                'llm_analysis': llm_elapsed_ms,
                'market_enrichment': market_elapsed_ms,
                'total': total_elapsed_ms,
            },
        },
        'quality_signals': {
            'resume_word_count': count_meaningful_words(resume_text),
            'job_description_present': bool(job_description.strip()),
            'job_feed_mode': 'live' if not full_time_error and not internship_error else 'partial',
            'market_region': settings.market_region_name,
        },
        'full_time_job_count': len(full_time_jobs),
        'internship_job_count': len(internship_jobs),
        'full_time_analysis': full_time_analysis,
        'internship_analysis': internship_analysis,
    }
