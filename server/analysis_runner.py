from __future__ import annotations

import base64

from config import get_settings
from gemini_client import generate_resume_extraction, generate_resume_rewrites
from redis_store import delete_upload_blob, get_upload_blob
from resume_pipeline import (
    build_result_payload,
    compute_ats_evaluation,
    detect_weak_bullets,
    extract_text_with_fallback,
    generate_tailored_pdf,
    persist_cached_result,
    update_task,
    validate_resume_text_quality,
)


def run_resume_analysis_task(
    *,
    task_id: str,
    filename: str,
    target_role: str,
    experience_level: str,
    job_description: str,
    cache_hash: str,
) -> dict:
    settings = get_settings()

    try:
        encoded_blob = get_upload_blob(task_id)
        if not encoded_blob:
            raise ValueError('Uploaded resume payload expired before processing started.')
        file_bytes = base64.b64decode(encoded_blob)

        update_task(task_id, status='processing', progress=10, current_step='Upload received')

        update_task(task_id, status='processing', progress=22, current_step='Parsing resume')
        resume_text, parsing_method = extract_text_with_fallback(file_bytes, filename)
        validate_resume_text_quality(resume_text)

        update_task(task_id, status='processing', progress=40, current_step='Calculating ATS score')
        evaluation = compute_ats_evaluation(resume_text, job_description, target_role)

        update_task(task_id, status='processing', progress=58, current_step='Extracting strengths and gaps')
        weak_bullets = detect_weak_bullets(resume_text)
        extraction = generate_resume_extraction(
            resume_text=resume_text,
            job_description=job_description,
            target_role=target_role,
            weak_bullets=weak_bullets,
        )

        update_task(task_id, status='processing', progress=76, current_step='Rewriting weak bullets')
        rewritten_bullets = generate_resume_rewrites(
            resume_text=resume_text,
            weak_bullets=weak_bullets,
            target_role=target_role,
            job_description=job_description,
        )

        update_task(task_id, status='processing', progress=90, current_step='Generating tailored PDF')
        generate_tailored_pdf(
            task_id=task_id,
            rewritten_bullets=rewritten_bullets,
            strengths=extraction.get('strengths', []),
            missing_skills=extraction.get('missing_skills', []),
            target_role=target_role,
        )
        download_url = f'{settings.public_backend_url}/api/download/{task_id}'

        result = build_result_payload(
            resume_text=resume_text,
            target_role=target_role,
            experience_level=experience_level,
            job_description=job_description,
            parsing_method=parsing_method,
            evaluation=evaluation,
            extraction=extraction,
            rewritten_bullets=rewritten_bullets,
            download_url=download_url,
        )

        persist_cached_result(cache_hash, result)
        update_task(task_id, status='completed', progress=100, current_step='Dashboard ready', result=result)
        return result
    except Exception as exc:
        update_task(task_id, status='failed', progress=100, current_step='Analysis failed', error=str(exc))
        raise
    finally:
        delete_upload_blob(task_id)
