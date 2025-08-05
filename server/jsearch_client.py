import os
import requests
from dotenv import load_dotenv

# Load environment variables from the .env file in the 'server/' directory
load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
# ✅ FIXED: The JSEARCH_API_URL variable definition was missing and has been restored.
JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search"

def fetch_jobs_from_jsearch(query: str, employment_types: str = "FULLTIME"):
    """
    Fetches job listings from the JSearch API based on a query.
    """
    if not RAPIDAPI_KEY:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!! CRITICAL ERROR: JSearch API key not found.       !!!")
        print("!!! 1. Make sure you have a .env file in the 'server' folder.")
        print("!!! 2. Ensure it contains: RAPIDAPI_KEY=your_actual_key")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        return None

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": query, "page": "1", "num_pages": "1", "country": "in",
        "employment_types": employment_types
    }

    try:
        print(f"--> Sending request to JSearch API with query: '{query}'")
        response = requests.get(JSEARCH_API_URL, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if "data" in data and data.get("data"):
            print(f"<-- SUCCESS: Received {len(data['data'])} jobs from API.")
            return data["data"]
        else:
            print(f"<-- WARN: API returned a success status, but no job data was found for query: {query}")
            return []
            
    except requests.exceptions.HTTPError as e:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(f"!!! HTTP ERROR: Status code {e.response.status_code} for query: {query}")
        print(f"!!! API Response Body: {e.response.text}")
        print("!!! This usually means the API Key is invalid, expired, or has hit its quota.")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        return None
    except requests.exceptions.RequestException as e:
        print(f"!!! NETWORK ERROR: Could not connect to JSearch API. Error: {e}")
        return None