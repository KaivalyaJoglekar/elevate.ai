# server/api_clients.py

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search"
JSEARCH_HOST = "jsearch.p.rapidapi.com"

async def _fetch_from_jsearch(query: str, employment_types: str):
    if not RAPIDAPI_KEY:
        print("!!! CRITICAL ERROR: RAPIDAPI_KEY not found. !!!")
        return None
    headers = {"X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": JSEARCH_HOST}
    params = {"query": query, "page": "1", "num_pages": "1", "country": "in", "employment_types": employment_types}
    try:
        async with httpx.AsyncClient() as client:
            print(f"--> Sending JSearch request for '{employment_types}' with query: '{query}' in region: 'in'")
            response = await client.get(JSEARCH_API_URL, headers=headers, params=params, timeout=20.0)
            response.raise_for_status()
        data = response.json()
        job_data = data.get("data", [])
        if job_data:
            print(f"<-- SUCCESS: Received {len(job_data)} {employment_types} jobs from JSearch.")
            return job_data
        else:
            print(f"<-- WARN: JSearch call was successful, but no {employment_types} data was found for query: {query}")
            return []
    except Exception as e:
        print(f"!!! ERROR from JSearch: {e}")
        return None

async def fetch_fulltime_jobs_from_jsearch(query: str):
    return await _fetch_from_jsearch(f"{query} developer", "FULLTIME")

async def fetch_internships_from_jsearch(query: str):
    return await _fetch_from_jsearch(f"{query} intern", "INTERN")