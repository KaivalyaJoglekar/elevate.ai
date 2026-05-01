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

def build_dual_analysis_prompt(
    *,
    resume_content: str,
    target_role: str,
    experience_level: str,
    job_description: str,
    market_context: dict[str, str] | None = None,
) -> str:
    effective_job_description = job_description.strip() or "No explicit job description was provided. Infer fit from the target role and the resume."
    market_context = market_context or {}
    market_region_name = market_context.get("region_name", "India")
    market_country_code = market_context.get("country_code", "in").upper()
    market_timezone = market_context.get("timezone", "Asia/Kolkata")
    market_currency = market_context.get("currency", "INR")

    return f"""
You are an expert AI career coach and ATS reviewer. Analyse the resume below for TWO scenarios simultaneously.
Return a SINGLE, valid JSON object. Do NOT include markdown, code fences, or explanatory text.

Target role: {target_role}
Candidate level: {experience_level}
Primary hiring market: {market_region_name} ({market_country_code})
Market context: timezone {market_timezone}, currency {market_currency}
Job description:
{effective_job_description[:6000]}

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
- Score ATS fit using role alignment, keyword coverage, clarity of resume structure, and evidence of impact.
- full_time_analysis: optimise for full-time hiring, ownership, measurable outcomes, and production readiness.
- internship_analysis: optimise for internships, growth potential, academic projects, and entry-level positioning.
- Keep all advice grounded in the {market_region_name} hiring market unless the resume or job description clearly specifies another geography.
- Prefer recruiter-ready language that works for Indian software, product, and startup hiring workflows.
- Do not introduce visa, GPA-scale, compensation, or relocation assumptions unless they are explicitly present in the input.
- extractedSkills must include both technical and soft skills explicitly supported by the resume.
- experienceSummary should be concrete and concise. Do not invent employers, dates, or metrics.
- educationSummary should copy the resume faithfully and preserve institution/degree details when present.
- generalResumeImprovements should be specific, actionable, and focused on resume quality.
- generalUpskillingSuggestions should be specific and role-relevant.

Resume Content:
---
{resume_content[:14000]}
---
""".strip()
