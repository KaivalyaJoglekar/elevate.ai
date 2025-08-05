# server/api_clients.py

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search"
JSEARCH_HOST = "jsearch.p.rapidapi.com"

async def _fetch_from_jsearch(query: str, employment_types: str):
    """A generic helper to make requests to the JSearch API."""
    if not RAPIDAPI_KEY:
        print("!!! CRITICAL ERROR: RAPIDAPI_KEY not found. !!!")
        return None

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": JSEARCH_HOST
    }
    
    params = {
        "query": query,
        "page": "1",
        "num_pages": "2",
        "country": "in",
        "employment_types": employment_types
    }

    try:
        async with httpx.AsyncClient() as client:
            print(f"--> Sending JSearch request for '{employment_types}' with query: '{query}'")
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
            
    except httpx.HTTPStatusError as e:
        print(f"!!! HTTP ERROR from JSearch: Status code {e.response.status_code} for query: {query}")
        return None
    except httpx.RequestError as e:
        print(f"!!! NETWORK ERROR: Could not connect to JSearch. Error: {e}")
        return None

async def fetch_fulltime_jobs_from_jsearch(query: str):
    """Fetches full-time job listings from the JSearch API using specific skills."""
    return await _fetch_from_jsearch(f"{query} developer", "FULLTIME")

async def fetch_internships_from_jsearch(query: str):
    """
    Fetches internship listings from JSearch.
    MODIFIED: Ignores the specific skill query and uses a generic term for better results.
    The skill matching will be handled by our backend analysis.
    """
    generic_internship_query = "Tech Intern"
    return await _fetch_from_jsearch(generic_internship_query, "INTERN")