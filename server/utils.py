# server/utils.py

import fitz  # PyMuPDF

def parse_pdf_text(pdf_content: bytes) -> str:
    """Extracts text content from a PDF file."""
    try:
        with fitz.open(stream=pdf_content, filetype="pdf") as doc:
            text = "".join(page.get_text() for page in doc)
        return text
    except Exception as e:
        print(f"Could not parse PDF content: {e}")
        return ""

FULL_TIME_PROMPT_TEMPLATE = """
You are an expert AI career coach. Analyze the following resume content strictly for FULL-TIME roles.
Return a SINGLE, valid JSON object. Do not include any markdown formatting or explanatory text. Your entire response must be ONLY the JSON object.
The JSON object structure must be:
{{
  "name": "string", "summary": "string", "atsScore": {{ "score": number, "feedback": "string" }},
  "extractedSkills": [{{ "name": "string" }}], "experienceSummary": ["string"], "educationSummary": ["string"],
  "generalResumeImprovements": ["string"], "generalUpskillingSuggestions": ["string"]
}}
Instructions:
- Tailor all summaries and recommendations for a candidate seeking a full-time position.
- Provide a comprehensive list of technical and soft skills.
- Resume Content:
---
{resume_content}
---
"""

INTERNSHIP_PROMPT_TEMPLATE = """
You are an expert AI career coach. Analyze the following resume content strictly for INTERNSHIP roles.
Return a SINGLE, valid JSON object. Do not include any markdown formatting or explanatory text. Your entire response must be ONLY the JSON object.
The JSON object structure must be:
{{
  "name": "string", "summary": "string", "atsScore": {{ "score": number, "feedback": "string" }},
  "extractedSkills": [{{ "name": "string" }}], "experienceSummary": ["string"], "educationSummary": ["string"],
  "generalResumeImprovements": ["string"], "generalUpskillingSuggestions": ["string"]
}}
Instructions:
- Tailor all summaries and recommendations for a student seeking an internship.
- If work experience is light, focus on academic and personal projects in the experience summary.
- Provide a comprehensive list of technical and soft skills.
- Resume Content:
---
{resume_content}
---
"""