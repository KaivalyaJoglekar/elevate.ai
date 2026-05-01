from __future__ import annotations

import hashlib
import io
import json
import re
import shutil
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from config import get_settings
from redis_store import (
    get_cached_analysis,
    get_sync_redis,
    rate_limit_key,
    set_cached_analysis,
    set_task_status,
)


_sentence_model: Any | None = None

STOPWORDS = {
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'into',
    'is', 'it', 'of', 'on', 'or', 'that', 'the', 'to', 'using', 'with', 'your',
    'you', 'will', 'our', 'this', 'their', 'they', 'we', 'who', 'have', 'has',
    'had', 'were', 'was', 'been', 'than', 'then', 'such', 'across', 'over', 'per',
    'role', 'team', 'years', 'year', 'experience', 'skills', 'work', 'ability',
}


def get_sentence_model() -> Any:
    global _sentence_model
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            _sentence_model = SentenceTransformer(
                get_settings().sentence_model_name,
                local_files_only=True,
            )
        except Exception:
            _sentence_model = False
    return _sentence_model


def compute_payload_hash(file_bytes: bytes, job_description: str, target_role: str, experience_level: str) -> str:
    digest = hashlib.sha256()
    digest.update(file_bytes)
    digest.update(job_description.encode('utf-8'))
    digest.update(target_role.encode('utf-8'))
    digest.update(experience_level.encode('utf-8'))
    return digest.hexdigest()


def enforce_daily_rate_limit(identifier: str) -> tuple[bool, int]:
    settings = get_settings()
    if (
        not settings.rate_limit_enabled
        or settings.rate_limit_per_day <= 0
        or identifier in {'127.0.0.1', '::1', 'localhost', 'testclient'}
    ):
        return True, settings.rate_limit_per_day

    now = datetime.now(timezone.utc)
    bucket = now.strftime('%Y-%m-%d')
    key = rate_limit_key(identifier, bucket)
    redis = get_sync_redis()
    count = redis.incr(key)
    if count == 1:
        tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        redis.expire(key, int((tomorrow - now).total_seconds()))
    return count <= settings.rate_limit_per_day, max(0, settings.rate_limit_per_day - count)


def initialize_task_state(task_id: str, cached: bool = False) -> dict[str, Any]:
    payload = {
        'success': True,
        'task_id': task_id,
        'status': 'queued',
        'progress': 3,
        'current_step': 'Task accepted',
        'cached': cached,
        'result': None,
        'error': None,
    }
    set_task_status(task_id, payload)
    return payload


def update_task(
    task_id: str,
    *,
    status: str,
    progress: int,
    current_step: str,
    result: dict[str, Any] | None = None,
    cached: bool | None = None,
    error: str | None = None,
) -> dict[str, Any]:
    current = get_sync_redis().get(f'analysis:task:{task_id}')
    payload = json.loads(current) if current else {'task_id': task_id, 'success': True}
    payload.update({
        'status': status,
        'progress': progress,
        'current_step': current_step,
        'error': error,
    })
    if result is not None:
        payload['result'] = result
    if cached is not None:
        payload['cached'] = cached
    set_task_status(task_id, payload)
    return payload


def extract_text_with_fallback(file_bytes: bytes, filename: str) -> tuple[str, str]:
    extension = Path(filename).suffix.lower()
    if extension != '.pdf':
        raise ValueError('Only PDF resumes are currently supported in the async pipeline.')

    import pdfplumber

    text_chunks: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            extracted = (page.extract_text() or '').strip()
            if extracted:
                text_chunks.append(extracted)

    text = '\n'.join(text_chunks).strip()
    if text:
        return normalize_text(text), 'pdfplumber'

    if not shutil.which('tesseract'):
        raise ValueError('PDF text extraction failed and OCR is unavailable because the tesseract binary is not installed.')

    import fitz
    import pytesseract
    from PIL import Image

    ocr_chunks: list[str] = []
    document = fitz.open(stream=file_bytes, filetype='pdf')
    try:
        for page in document:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image = Image.open(io.BytesIO(pixmap.tobytes('png')))
            ocr_chunks.append(pytesseract.image_to_string(image))
    finally:
        document.close()

    ocr_text = '\n'.join(chunk.strip() for chunk in ocr_chunks if chunk.strip()).strip()
    if not ocr_text:
        raise ValueError('Unable to extract text from this resume, including OCR fallback.')
    return normalize_text(ocr_text), 'ocr'


def normalize_text(text: str) -> str:
    cleaned = re.sub(r'\r\n?', '\n', text)
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()


def count_meaningful_words(text: str) -> int:
    return len(re.findall(r'[A-Za-z0-9][A-Za-z0-9+.#/-]*', text))


def validate_resume_text_quality(resume_text: str, *, minimum_words: int | None = None) -> int:
    required_words = minimum_words or get_settings().minimum_resume_words
    word_count = count_meaningful_words(resume_text)
    if word_count < required_words:
        raise ValueError(
            f'Resume text extraction succeeded but only {word_count} readable words were found. '
            f'Upload a clearer text-based PDF with at least {required_words} readable words.'
        )
    return word_count


def _extract_keywords(job_description: str, limit: int = 20) -> list[str]:
    tokens = re.findall(r'[A-Za-z][A-Za-z0-9+.#-]{2,}', job_description.lower())
    filtered = [token for token in tokens if token not in STOPWORDS]
    counts = Counter(filtered)
    return [token for token, _ in counts.most_common(limit)]


def build_reference_text(target_role: str, job_description: str) -> str:
    if job_description.strip():
        return job_description.strip()
    return (
        f"Target role: {target_role}. Evaluate the resume for role alignment, technical depth, "
        f"project impact, delivery skills, communication, tooling, and production readiness."
    )


def _contains_pattern(text: str, patterns: list[str]) -> bool:
    return any(re.search(pattern, text, re.IGNORECASE | re.MULTILINE) for pattern in patterns)


def compute_resume_structure_score(resume_text: str, parsing_method: str) -> dict[str, Any]:
    lowered = resume_text.lower()
    section_patterns = {
        'contact': [r'@', r'linkedin\.com', r'github\.com', r'\+?\d[\d\s().-]{7,}'],
        'summary': [r'^\s*(summary|profile|objective)\s*$'],
        'experience': [r'^\s*(experience|work experience|employment|professional experience)\s*$'],
        'education': [r'^\s*(education|academic background)\s*$'],
        'skills': [r'^\s*(skills|technical skills|core competencies)\s*$'],
        'projects': [r'^\s*(projects|project experience)\s*$'],
    }

    section_hits = {
        name: _contains_pattern(resume_text, patterns)
        for name, patterns in section_patterns.items()
    }
    section_score = round((sum(section_hits.values()) / len(section_hits)) * 100)

    contact_signals = {
        'email': bool(re.search(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', resume_text, re.IGNORECASE)),
        'phone': bool(re.search(r'(?:\+?\d[\d\s().-]{7,}\d)', resume_text)),
        'linkedin_or_github': bool(re.search(r'(linkedin\.com|github\.com)', lowered)),
    }
    contact_score = round((sum(contact_signals.values()) / len(contact_signals)) * 100)

    bullet_lines = [line.strip() for line in resume_text.splitlines() if line.strip().startswith(('-', '*', '•'))]
    bullet_score = 80 if len(bullet_lines) >= 4 else 60 if len(bullet_lines) >= 2 else 40
    parse_score = 100 if parsing_method == 'pdfplumber' else 80

    formatting_score = round((section_score * 0.45) + (contact_score * 0.25) + (bullet_score * 0.2) + (parse_score * 0.1))
    return {
        'formatting_score': formatting_score,
        'section_score': section_score,
        'contact_score': contact_score,
        'section_hits': section_hits,
        'contact_signals': contact_signals,
        'bullet_line_count': len(bullet_lines),
    }


def build_ats_feedback(evaluation: dict[str, Any]) -> str:
    score = evaluation['ats_score']
    missing_keywords = evaluation['missing_keywords']
    weak_bullets = evaluation['weak_bullets']
    section_hits = evaluation['section_hits']

    strengths: list[str] = []
    issues: list[str] = []

    if evaluation['keyword_score'] >= 75:
        strengths.append('good keyword alignment')
    elif missing_keywords:
        issues.append('missing role keywords')

    if evaluation['formatting_score'] >= 75:
        strengths.append('clear ATS-friendly structure')
    else:
        issues.append('section labeling or contact details need cleanup')

    if evaluation['bullet_score'] >= 70:
        strengths.append('solid impact-oriented bullet writing')
    elif weak_bullets:
        issues.append('bullets lack metrics or action verbs')

    if not section_hits.get('skills'):
        issues.append('missing a clearly labeled skills section')
    if not section_hits.get('experience'):
        issues.append('experience section is hard to detect')

    if score >= 85:
        return f"Strong ATS fit with {', '.join(strengths[:2])}."
    if score >= 70:
        if issues:
            return f"Good ATS foundation, but {issues[0]}."
        return f"Good ATS foundation with {', '.join(strengths[:2])}."
    if issues:
        return f"ATS fit is limited because {issues[0]}."
    return "ATS fit is limited and the resume needs clearer role alignment."


def build_ats_improvements(evaluation: dict[str, Any]) -> list[str]:
    suggestions: list[str] = []
    if evaluation['missing_keywords']:
        suggestions.append(
            f"Add role-specific keywords naturally in experience and skills sections, such as: {', '.join(evaluation['missing_keywords'][:5])}."
        )
    if not evaluation['section_hits'].get('skills'):
        suggestions.append('Add a clearly labeled Skills section so ATS parsers can map your stack faster.')
    if not evaluation['section_hits'].get('experience'):
        suggestions.append('Use a clearly labeled Experience section with job title, company, and dates on separate lines.')
    if not evaluation['contact_signals'].get('phone'):
        suggestions.append('Add a phone number in the header because many ATS templates expect core contact details together.')
    if not evaluation['contact_signals'].get('linkedin_or_github'):
        suggestions.append('Include a LinkedIn or GitHub URL in the header to improve profile completeness.')
    if evaluation['weak_bullets']:
        suggestions.append('Rewrite bullets to start with action verbs and include measurable impact where possible.')
    if evaluation['formatting_score'] < 70:
        suggestions.append('Keep formatting simple: single column, standard headings, and consistent spacing for ATS parsing.')
    if not suggestions:
        suggestions.append('Keep role keywords, impact metrics, and section headings consistent as you tailor this resume for each application.')
    return suggestions[:5]


def compute_ats_evaluation(
    resume_text: str,
    job_description: str,
    target_role: str,
    *,
    parsing_method: str = 'pdfplumber',
    scoring_mode: str = 'full-time',
) -> dict[str, Any]:
    reference_text = build_reference_text(target_role, job_description)
    model = get_sentence_model()
    similarity = 0.0
    semantic_score = 0
    if model:
        from sentence_transformers import util

        embeddings = model.encode([resume_text[:8000], reference_text[:4000]], convert_to_tensor=True)
        similarity = float(util.cos_sim(embeddings[0], embeddings[1]).item())
        semantic_score = max(0, min(100, round(((similarity + 1.0) / 2.0) * 100)))

    keywords = _extract_keywords(reference_text)
    if keywords:
        matched_keywords = [keyword for keyword in keywords if re.search(rf'\b{re.escape(keyword)}\b', resume_text, re.IGNORECASE)]
        keyword_score = round((len(matched_keywords) / len(keywords)) * 100)
    else:
        matched_keywords = []
        keyword_score = 100

    missing_keywords = [keyword for keyword in keywords if keyword not in matched_keywords]
    weak_bullets = detect_weak_bullets(resume_text)
    bullet_candidates = [
        line.strip()
        for line in resume_text.splitlines()
        if line.strip().startswith(('-', '*', '•'))
    ]
    if bullet_candidates:
        strong_ratio = 1 - (len(weak_bullets) / len(bullet_candidates))
        bullet_score = max(35, min(100, round(strong_ratio * 100)))
    else:
        bullet_score = 45

    if not model:
        semantic_score = keyword_score
        similarity = round(max(0, min(1, keyword_score / 100)), 4)

    structure = compute_resume_structure_score(resume_text, parsing_method)
    if scoring_mode == 'internship':
        ats_score = round(
            (keyword_score * 0.30)
            + (semantic_score * 0.18)
            + (structure['formatting_score'] * 0.27)
            + (bullet_score * 0.15)
            + (structure['contact_score'] * 0.10)
        )
    else:
        ats_score = round(
            (keyword_score * 0.30)
            + (semantic_score * 0.20)
            + (structure['formatting_score'] * 0.20)
            + (bullet_score * 0.20)
            + (structure['contact_score'] * 0.10)
        )

    evaluation = {
        'semantic_similarity': round(similarity, 4),
        'semantic_score': semantic_score,
        'keyword_score': keyword_score,
        'bullet_score': bullet_score,
        'formatting_score': structure['formatting_score'],
        'section_score': structure['section_score'],
        'contact_score': structure['contact_score'],
        'ats_score': ats_score,
        'matched_keywords': matched_keywords[:12],
        'missing_keywords': missing_keywords[:12],
        'weak_bullets': weak_bullets[:5],
        'section_hits': structure['section_hits'],
        'contact_signals': structure['contact_signals'],
        'reference_text_excerpt': reference_text[:400],
        'score_breakdown': [
            {'label': 'Keyword Match', 'score': keyword_score},
            {'label': 'Role Alignment', 'score': semantic_score},
            {'label': 'Resume Structure', 'score': structure['formatting_score']},
            {'label': 'Bullet Impact', 'score': bullet_score},
        ],
    }
    evaluation['feedback'] = build_ats_feedback(evaluation)
    evaluation['improvements'] = build_ats_improvements(evaluation)
    return evaluation


def detect_weak_bullets(resume_text: str) -> list[str]:
    bullets = [
        line.strip()
        for line in resume_text.splitlines()
        if line.strip().startswith(('-', '*', '•'))
    ]
    weak = []
    for bullet in bullets:
        has_metric = bool(re.search(r'\b\d+[%+]?\b', bullet))
        has_action = bool(re.search(r'\b(built|developed|implemented|designed|led|improved|reduced|increased|created|optimized|launched|automated|scaled)\b', bullet, re.IGNORECASE))
        if len(bullet.split()) < 7 or not has_metric or not has_action:
            weak.append(bullet)
    return weak[:5]


def generate_tailored_pdf(
    task_id: str,
    rewritten_bullets: list[dict[str, str]],
    strengths: list[str],
    missing_skills: list[str],
    target_role: str,
) -> str:
    from reportlab.lib.pagesizes import LETTER
    from reportlab.pdfbase.pdfmetrics import stringWidth
    from reportlab.pdfgen import canvas

    settings = get_settings()
    output_dir = Path(settings.generated_resume_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f'{task_id}.pdf'

    pdf = canvas.Canvas(str(output_path), pagesize=LETTER)
    width, height = LETTER
    margin = 54
    cursor_y = height - margin

    def draw_heading(text: str) -> None:
        nonlocal cursor_y
        pdf.setFont('Helvetica-Bold', 16)
        pdf.drawString(margin, cursor_y, text)
        cursor_y -= 22

    def draw_body(lines: list[str]) -> None:
        nonlocal cursor_y
        pdf.setFont('Helvetica', 10.5)
        max_width = width - (margin * 2)
        for line in lines:
            wrapped = wrap_text(line, max_width)
            for segment in wrapped:
                if cursor_y < margin:
                    pdf.showPage()
                    cursor_y = height - margin
                    pdf.setFont('Helvetica', 10.5)
                pdf.drawString(margin, cursor_y, segment)
                cursor_y -= 15
            cursor_y -= 4

    draw_heading(f'Elevate.ai Tailored Resume Notes - {target_role}')
    draw_body([f'Generated at {datetime.now(timezone.utc).isoformat()}'])
    draw_heading('Rewritten Bullets')
    draw_body([item.get('rewritten', '') for item in rewritten_bullets] or ['No rewritten bullets generated.'])
    draw_heading('Strengths')
    draw_body(strengths or ['No strengths identified.'])
    draw_heading('Missing Skills')
    draw_body(missing_skills or ['No missing skills identified.'])
    pdf.save()

    return str(output_path)


def wrap_text(text: str, max_width: float, font_name: str = 'Helvetica', font_size: float = 10.5) -> list[str]:
    from reportlab.pdfbase.pdfmetrics import stringWidth

    words = text.split()
    if not words:
        return ['']

    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f'{current} {word}'
        if stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def build_result_payload(
    *,
    resume_text: str,
    target_role: str,
    experience_level: str,
    job_description: str,
    parsing_method: str,
    evaluation: dict[str, Any],
    extraction: dict[str, Any],
    rewritten_bullets: list[dict[str, str]],
    download_url: str,
) -> dict[str, Any]:
    settings = get_settings()
    return {
        'target_role': target_role,
        'experience_level': experience_level,
        'job_description_excerpt': evaluation.get('reference_text_excerpt', job_description[:400]),
        'resume_excerpt': resume_text[:800],
        'parsing_method': parsing_method,
        'ats_score': evaluation['ats_score'],
        'semantic_similarity': evaluation['semantic_similarity'],
        'score_breakdown': {
            'semantic_alignment': evaluation['semantic_score'],
            'keyword_coverage': evaluation['keyword_score'],
            'bullet_strength': evaluation['bullet_score'],
        },
        'matched_keywords': evaluation['matched_keywords'],
        'missing_keywords': evaluation['missing_keywords'],
        'missing_skills': extraction.get('missing_skills', []),
        'strengths': extraction.get('strengths', []),
        'weak_bullets': extraction.get('weak_bullets', []),
        'rewritten_bullets': rewritten_bullets,
        'tailored_resume_download_url': download_url,
        'market_context': {
            'country_code': settings.market_country_code,
            'region_name': settings.market_region_name,
            'timezone': settings.market_timezone,
            'currency': settings.market_currency,
        },
        'analysis_metadata': {
            'backend_version': settings.app_version,
            'generated_at_utc': datetime.now(timezone.utc).isoformat(),
            'resume_word_count': count_meaningful_words(resume_text),
        },
    }


def maybe_return_cached(cache_hash: str, task_id: str) -> dict[str, Any] | None:
    cached = get_cached_analysis(cache_hash)
    if not cached:
        return None
    if not should_cache_result(cached):
        return None
    update_task(
        task_id,
        status='completed',
        progress=100,
        current_step='Cached analysis found',
        result=cached,
        cached=True,
    )
    return cached


def should_cache_result(result: dict[str, Any]) -> bool:
    market_status = str(result.get('job_market_status', '')).lower()
    if 'unavailable' in market_status or 'failed' in market_status or 'error' in market_status:
        return False

    full_time_count = len(((result.get('full_time_analysis') or {}).get('careerPaths') or []))
    internship_count = len(((result.get('internship_analysis') or {}).get('careerPaths') or []))
    return (full_time_count + internship_count) > 0


def persist_cached_result(cache_hash: str, result: dict[str, Any]) -> None:
    if not should_cache_result(result):
        return
    set_cached_analysis(cache_hash, result)
