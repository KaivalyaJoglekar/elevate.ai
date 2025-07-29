# server/main.py

import base64
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import binascii

from nlp_processor import *
from jsearch_client import fetch_jobs_from_jsearch

app = FastAPI(title="Elevate-AI Dual Analysis Backend")

# This list will contain the URLs of our deployed frontend and backend.
# We will add them after we deploy.
origins = [
    "http://localhost:5173", # For local development
    "http://12-7.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeRequest(BaseModel):
    file_content: str

def perform_analysis(resume_text: str, job_type: str) -> dict:
    # ... (This entire helper function remains the same as the previous correct version)
    name = extract_name(resume_text)
    skills = extract_skills(resume_text)
    if not skills: raise ValueError("No skills found.")
    experience_summary = extract_section_content(resume_text, "Experience")
    education_summary = extract_section_content(resume_text, "Education")
    professional_summary = generate_professional_summary(resume_text, skills, job_type)
    ats_score = generate_dynamic_ats_score(resume_text, skills, experience_summary, education_summary)
    
    job_listings = None
    if len(skills) >= 2: job_listings = fetch_jobs_from_jsearch(query=f'"{skills[0]} {skills[1]} {job_type}"')
    if not job_listings: job_listings = fetch_jobs_from_jsearch(query=f'"{skills[0]} {job_type}"')
    if not job_listings: job_listings = fetch_jobs_from_jsearch(query=f'"Software Developer {job_type}"')
    job_listings = job_listings or []

    career_paths = []
    first_skill_gap = []
    if job_listings:
        job_descriptions = [job.get('job_description', '') for job in job_listings]
        similarity_scores = calculate_semantic_similarity(resume_text, job_descriptions)
        for i, job in enumerate(job_listings[:15]):
            skill_gap = analyze_skill_gap(set(skills), job_descriptions[i])
            if i == 0 and skill_gap["missing_skills"]: first_skill_gap = skill_gap["missing_skills"]
            relevant_skills = [{"name": s} for s in skill_gap["matching_skills"]]
            skills_to_develop = [{"name": s} for s in skill_gap["missing_skills"]]
            skills_for_chart = [s['name'] for s in relevant_skills[:4]] + [s['name'] for s in skills_to_develop[:3]]
            skill_proficiency_data = generate_realtime_skill_proficiency(job.get("job_title", ""), resume_text, skills_for_chart, job_type)
            career_paths.append({
                "role": job.get("job_title", "N/A"),
                "employer_name": job.get("employer_name", "N/A"),
                "employer_logo": job.get("employer_logo"),
                "job_link": job.get("job_apply_link") or f"https://www.google.com/search?q={job.get('job_title', '')} {job.get('employer_name', '')}",
                "description": (job.get("job_description") or "No description.")[:150] + "...",
                "matchPercentage": int(round(similarity_scores[i] * 100)),
                "relevantSkills": relevant_skills,
                "skillsToDevelop": skills_to_develop,
                "skillProficiencyAnalysis": skill_proficiency_data
            })
        career_paths.sort(key=lambda x: x["matchPercentage"], reverse=True)
    
    improvements, upskilling = generate_dynamic_recommendations(skills, first_skill_gap, job_type)
    return {
        "name": name, "summary": professional_summary, "atsScore": ats_score,
        "extractedSkills": [{"name": s} for s in skills], "experienceSummary": experience_summary,
        "educationSummary": education_summary, "careerPaths": career_paths,
        "generalResumeImprovements": improvements, "generalUpskillingSuggestions": upskilling,
    }

@app.post("/analyze-resume-dual/")
async def analyze_resume_dual_endpoint(request: ResumeRequest):
    try:
        file_content = request.file_content
        missing_padding = len(file_content) % 4
        if missing_padding: file_content += '=' * (4 - missing_padding)
        pdf_bytes = base64.b64decode(file_content, validate=True)
        resume_text = parse_pdf_text(pdf_bytes)
        if not resume_text.strip(): raise ValueError("Parsed PDF text is empty.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing error: {e}")
    try:
        full_time_analysis = perform_analysis(resume_text, 'full-time')
        internship_analysis = perform_analysis(resume_text, 'internship')
        return {"full_time_analysis": full_time_analysis, "internship_analysis": internship_analysis}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Elevate-AI Backend is running"}