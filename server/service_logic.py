import asyncio
import base64
from fastapi import HTTPException

from api_clients import fetch_fulltime_jobs_from_jsearch, fetch_internships_from_jsearch
from career_mapper import adapt_jsearch_to_career_path
from gemini_client import get_dual_analysis
from utils import DUAL_ANALYSIS_PROMPT_TEMPLATE, parse_pdf_text


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
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"File processing error: {exc}") from exc

    prompt = DUAL_ANALYSIS_PROMPT_TEMPLATE.format(resume_content=resume_text)
    result = await get_dual_analysis(prompt)

    if not result or 'full_time_analysis' not in result or 'internship_analysis' not in result:
        raise HTTPException(status_code=500, detail="AI analysis failed. Check service logs.")

    result['full_time_analysis']['careerPaths'] = []
    result['internship_analysis']['careerPaths'] = []
    return result


async def run_jobs_search(query: str, job_type: str) -> list:
    if job_type == 'full-time':
        jobs_data = await fetch_fulltime_jobs_from_jsearch(query)
    else:
        jobs_data = await fetch_internships_from_jsearch(query)

    if jobs_data is None:
        raise HTTPException(status_code=503, detail="Job search service unavailable.")

    query_skills = query.split()
    return adapt_jsearch_to_career_path(jobs_data, job_type, query_skills)
