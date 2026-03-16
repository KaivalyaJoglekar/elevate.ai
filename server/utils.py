# server/utils.py

import fitz  # PyMuPDF
from pydantic import BaseModel
from typing import List, Optional

# ─── Pydantic Schemas (for structured Gemini output validation) ───────────────

class AtsScore(BaseModel):
    score: int
    feedback: str

class Skill(BaseModel):
    name: str

class CareerAnalysis(BaseModel):
    name: str
    summary: str
    atsScore: AtsScore
    extractedSkills: List[Skill]
    experienceSummary: List[str]
    educationSummary: List[str]
    generalResumeImprovements: List[str]
    generalUpskillingSuggestions: List[str]

class DualAnalysisResponse(BaseModel):
    full_time_analysis: CareerAnalysis
    internship_analysis: CareerAnalysis

# ─── PDF Parser ───────────────────────────────────────────────────────────────

def parse_pdf_text(pdf_content: bytes) -> str:
    """Extracts text content from a PDF file (runs in a thread pool)."""
    try:
        with fitz.open(stream=pdf_content, filetype="pdf") as doc:
            return "".join(page.get_text() for page in doc)
    except Exception as e:
        print(f"Could not parse PDF content: {e}")
        return ""

# ─── Combined prompt ──────────────────────────────────────────────────────────

DUAL_ANALYSIS_PROMPT_TEMPLATE = """
You are an expert AI career coach. Analyse the resume below for TWO scenarios simultaneously.
Return a SINGLE, valid JSON object. Do NOT include markdown, code fences, or explanatory text — only the raw JSON.

The JSON structure must be exactly:
{{
  "full_time_analysis": {{
    "name": "string",
    "summary": "string",
    "atsScore": {{ "score": number, "feedback": "string" }},
    "extractedSkills": [{{ "name": "string" }}],
    "experienceSummary": ["string"],
    "educationSummary": ["string"],
    "generalResumeImprovements": ["string"],
    "generalUpskillingSuggestions": ["string"]
  }},
  "internship_analysis": {{
    "name": "string",
    "summary": "string",
    "atsScore": {{ "score": number, "feedback": "string" }},
    "extractedSkills": [{{ "name": "string" }}],
    "experienceSummary": ["string"],
    "educationSummary": ["string"],
    "generalResumeImprovements": ["string"],
    "generalUpskillingSuggestions": ["string"]
  }}
}}

Instructions:
- full_time_analysis: Tailor all advice for someone pursuing a permanent, full-time position. Emphasise measurable impact, leadership potential, and career trajectory.
- internship_analysis: Tailor all advice for a student seeking an internship. If professional experience is sparse, lean heavily on academic projects, open-source contributions, and transferable skills. Keep ATS score expectations realistic for entry-level candidates.
- extractedSkills should be a comprehensive list of both technical and soft skills found in the resume.
- For ATS scores: base the score on keyword density, formatting clarity, and role-fit.
- Provide at least 4 concrete improvements and upskilling suggestions per section.

Resume Content:
---
{resume_content}
---
"""