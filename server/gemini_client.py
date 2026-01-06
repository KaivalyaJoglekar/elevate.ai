# server/gemini_client.py

import os
import google.generativeai as genai
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('models/gemini-2.5-flash')
else:
    print("!!! WARNING: GEMINI_API_KEY not found. Gemini features will not work.")
    model = None

async def get_gemini_analysis(prompt: str) -> dict | None:
    """
    Sends a prompt to the Gemini API and robustly extracts and parses the JSON response.
    Includes retry logic for rate limits (429).
    """
    if not model:
        print("!!! ERROR: Attempted to use Gemini API but model is not initialized (missing API key).")
        return None

    retries = 3
    base_delay = 2

    for attempt in range(retries):
        try:
            print(f"--> Sending analysis request to Gemini (Attempt {attempt + 1}/{retries})...")
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            print("<-- Received a valid response from Gemini.")
            
            text_response = response.text
            json_start = text_response.find('{')
            json_end = text_response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                print(f"!!! PARSING FAILED: Could not find a valid JSON object in the response.")
                return None
                
            json_string = text_response[json_start:json_end]
            return json.loads(json_string)

        except Exception as e:
            error_msg = str(e)
            is_json_error = "Expecting" in error_msg or "JSON" in error_msg or isinstance(e, json.JSONDecodeError)
            
            if "429" in error_msg or "Quota exceeded" in error_msg or is_json_error:
                if attempt < retries - 1:
                    wait_time = base_delay * (2 ** attempt)
                    reason = "Rate Limit" if "429" in error_msg else "Malformed JSON"
                    print(f"!!! {reason} error. Retrying in {wait_time} seconds... (Attempt {attempt + 1}/{retries})")
                    await asyncio.sleep(wait_time)
                    continue
            
            print(f"!!! CRITICAL: An error occurred while calling the Gemini API: {e}")
            return None
            
    return None