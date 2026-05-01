import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

from config import get_settings

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search"
JSEARCH_HOST = "jsearch.p.rapidapi.com"


settings = get_settings()


def _normalize_query(query: str) -> str:
    return " ".join(query.split()).strip()


async def _fetch_from_jsearch(query: str, employment_types: str):
    if not RAPIDAPI_KEY:
        raise HTTPException(status_code=503, detail="RAPIDAPI_KEY is not configured.")
    search_query = _normalize_query(query)
    if not search_query:
        raise HTTPException(status_code=422, detail="A search query is required.")

    headers = {"X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": JSEARCH_HOST}
    params = {
        "query": search_query,
        "page": "1",
        "num_pages": "1",
        "country": settings.market_country_code,
        "employment_types": employment_types,
    }
    try:
        async with httpx.AsyncClient() as client:
            print(
                f"--> Sending JSearch request for '{employment_types}' with query: "
                f"'{search_query}' in region: '{settings.market_region_name}' "
                f"({settings.market_country_code.upper()})"
            )
            response = await client.get(
                JSEARCH_API_URL,
                headers=headers,
                params=params,
                timeout=settings.job_search_timeout_seconds,
            )
            response.raise_for_status()
        data = response.json()
        job_data = data.get("data", [])
        if job_data:
            print(f"<-- SUCCESS: Received {len(job_data)} {employment_types} jobs from JSearch.")
            return job_data
        else:
            print(f"<-- WARN: JSearch call was successful, but no {employment_types} data was found for query: {query}")
            return []
    except httpx.HTTPStatusError as exc:
        detail = (
            f"JSearch returned {exc.response.status_code} for "
            f"{employment_types.lower()} roles in {settings.market_region_name}."
        )
        try:
            payload = exc.response.json()
            if isinstance(payload, dict):
                detail = str(payload.get("message") or payload.get("detail") or detail)
        except Exception:
            if exc.response.text:
                detail = exc.response.text
        print(f"!!! ERROR from JSearch: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=detail) from exc
    except httpx.RequestError as exc:
        print(f"!!! ERROR from JSearch: {exc}")
        raise HTTPException(status_code=503, detail=f"JSearch request failed: {exc}") from exc

async def fetch_fulltime_jobs_from_jsearch(query: str):
    return await _fetch_from_jsearch(query, "FULLTIME")

async def fetch_internships_from_jsearch(query: str):
    internship_query = query if 'intern' in query.lower() else f"{query} internship"
    return await _fetch_from_jsearch(internship_query, "INTERN")
