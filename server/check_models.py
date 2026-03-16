
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No API key found")
else:
    client = genai.Client(api_key=api_key)
    print("Listing models...")
    try:
        for model in client.models.list():
            print(model.name)
    except Exception as e:
        print(f"Error listing models: {e}")
