import os
import requests # type: ignore
from dotenv import load_dotenv # type: ignore

# Load environment variables from the .env file
load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search"

def fetch_jobs_from_jsearch(query: str, num_pages: int = 1):
    """
    Fetches job listings from the JSearch API based on a query.

    Args:
        query (str): The search query (e.g., "Software Engineer Python").
        num_pages (int): The number of result pages to fetch.

    Returns:
        list: A list of job data dictionaries, or None if the request fails.
    """
    if not RAPIDAPI_KEY:
        print("Error: RAPIDAPI_KEY not found. Please check your server/.env file.")
        return None

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": query,
        "page": str(num_pages),
        "num_pages": "1"
    }

    try:
        response = requests.get(JSEARCH_API_URL, headers=headers, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()
        
        # The actual job listings are inside the 'data' key
        if "data" in data and data["data"]:
            return data["data"]
        else:
            print(f"JSearch API returned no job data for the query: {query}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching jobs from JSearch API: {e}")
        return None