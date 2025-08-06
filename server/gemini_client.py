# server/gemini_client.py

import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("FATAL ERROR: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash-latest')

async def get_gemini_analysis(prompt: str) -> dict | None:
    """
    Sends a prompt to the Gemini API and robustly extracts and parses the JSON response.
    """
    try:
        print("--> Sending analysis request to Gemini 1.5 Flash...")
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
        print(f"!!! CRITICAL: An error occurred while calling the Gemini API: {e}")
        return None