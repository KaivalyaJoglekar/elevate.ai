# server/gemini_client.py

import os
import json
import asyncio
from google import genai
from google.genai import errors, types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    print("!!! WARNING: GEMINI_API_KEY not found. AI analysis will not work.")
    client = None

async def get_dual_analysis(prompt: str) -> dict | None:
    """
    Sends a single merged prompt to the AI and returns the dual-analysis JSON.
    Retries up to 3 times for rate-limit (429) or malformed-JSON errors.
    """
    if not client:
        print("!!! ERROR: AI model not initialised (missing API key).")
        return None

    retries   = 3
    base_delay = 2

    for attempt in range(retries):
        try:
            print(f"--> Sending dual-analysis request to AI (attempt {attempt + 1}/{retries})…")
            response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            print("<-- Received response from AI.")

            text = response.text

            # Robustly extract JSON regardless of any accidental wrapping
            json_start = text.find('{')
            json_end   = text.rfind('}') + 1

            if json_start == -1 or json_end == 0:
                raise ValueError("No valid JSON object found in AI response.")

            data = json.loads(text[json_start:json_end])

            # Validate top-level shape
            if 'full_time_analysis' not in data or 'internship_analysis' not in data:
                raise ValueError("AI response missing required top-level keys.")

            return data

        except Exception as e:
            msg = str(e)
            retriable = (
                "429"            in msg
                or "Quota"       in msg
                or "JSON"        in msg
                or "Expecting"   in msg
                or (isinstance(e, errors.APIError) and e.code in {429, 500, 503})
                or isinstance(e, (json.JSONDecodeError, ValueError))
            )

            if retriable and attempt < retries - 1:
                wait = base_delay * (2 ** attempt)
                reason = "Rate limit" if "429" in msg or "Quota" in msg else "Parse error"
                print(f"!!! {reason}. Retrying in {wait}s… (attempt {attempt + 1}/{retries})")
                await asyncio.sleep(wait)
                continue

            print(f"!!! CRITICAL – AI error: {e}")
            return None

    return None