# server/main.py

import base64
import uvicorn
import asyncio
import re
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List
import traceback

from gemini_client import get_gemini_analysis
from utils import FULL_TIME_PROMPT_TEMPLATE, INTERNSHIP_PROMPT_TEMPLATE, parse_pdf_text
from api_clients import fetch_fulltime_jobs_from_jsearch, fetch_internships_from_jsearch

app = FastAPI(title="Elevate-AI Gemini Analysis Backend")
# Allow all origins to fix CORS issues across different deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ResumeRequest(BaseModel):
    file_content: str

class JobSearchRequest(BaseModel):
    query: str
    job_type: Literal['full-time', 'internship']

def adapt_jsearch_to_career_path(jsearch_jobs: list, job_type: str, skills_query: List[str]) -> list:
    if not jsearch_jobs: return []
    query_skills_set = set(s.lower() for s in skills_query if s)
    
    career_paths = []
    for job in jsearch_jobs[:7]:
        job_desc = (job.get("job_description") or "").lower()
        job_skills_found = set(re.findall(r'\b\w+\b', job_desc))
        
        relevant_skills = list(query_skills_set.intersection(job_skills_found))
        skills_to_develop = list(job_skills_found.difference(query_skills_set))
        skills_to_develop = [s for s in skills_to_develop if s in query_skills_set or len(s) > 3][:5]
        
        match_percentage = int((len(relevant_skills) / len(query_skills_set)) * 100) if query_skills_set else 0
        match_percentage = min(match_percentage + random.randint(30, 50), 95)
        
        proficiency_analysis = []
        chart_skills = (relevant_skills + skills_to_develop)[:5]
        for skill in chart_skills:
            is_user_skill = skill in relevant_skills
            proficiency_analysis.append({
                "skill": skill.capitalize(),
                "userProficiency": random.randint(60, 85) if is_user_skill else random.randint(10, 30),
                "requiredProficiency": random.randint(65, 80) if job_type == 'full-time' else random.randint(45, 60)
            })
            
        career_paths.append({
            "role": job.get("job_title", "N/A"),
            "employer_name": job.get("employer_name", "N/A"),
            "employer_logo": job.get("employer_logo"),
            "description": (job.get("job_description") or "No description available.")[:100] + "...",
            "job_link": job.get("job_apply_link", f"https://www.google.com/search?q={job.get('job_title', '')}"),
            "matchPercentage": match_percentage,
            "relevantSkills": [{"name": s.capitalize()} for s in relevant_skills[:5]],
            "skillsToDevelop": [{"name": s.capitalize()} for s in skills_to_develop],
            "skillProficiencyAnalysis": proficiency_analysis
        })
        
    return sorted(career_paths, key=lambda x: x["matchPercentage"], reverse=True)

@app.post("/analyze-resume-dual/")
async def analyze_resume_dual_endpoint(request: ResumeRequest):
    try:
        file_content = request.file_content
        missing_padding = len(file_content) % 4
        if missing_padding: file_content += '=' * (4 - missing_padding)
        pdf_bytes = base64.b64decode(file_content, validate=True)
        resume_text = parse_pdf_text(pdf_bytes)
        if not resume_text.strip(): raise ValueError("Parsed resume text is empty.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing error: {e}")
    try:
        full_time_prompt = FULL_TIME_PROMPT_TEMPLATE.format(resume_content=resume_text)
        internship_prompt = INTERNSHIP_PROMPT_TEMPLATE.format(resume_content=resume_text)
        print("--> Sending concurrent analysis requests to Gemini...")
        ai_results = await asyncio.gather(get_gemini_analysis(full_time_prompt), get_gemini_analysis(internship_prompt))
        print("<-- Received responses from Gemini.")
        full_time_analysis, internship_analysis = ai_results[0], ai_results[1]
        if not full_time_analysis or not internship_analysis:
            raise HTTPException(status_code=500, detail="AI analysis failed for one or both contexts.")
        extracted_skills = [skill['name'] for skill in full_time_analysis.get('extractedSkills', [])]
        if not extracted_skills: raise ValueError("Could not extract skills from resume to search for jobs.")
        search_query = " ".join(extracted_skills[:3])
        print(f"--> Generated job search query: '{search_query}'")
        print("--> Fetching real-time jobs from JSearch API...")
        job_results = await asyncio.gather(fetch_fulltime_jobs_from_jsearch(search_query), fetch_internships_from_jsearch(search_query))
        print("<-- Received job data from JSearch API.")
        full_time_analysis['careerPaths'] = adapt_jsearch_to_career_path(job_results[0], 'full-time', extracted_skills)
        internship_analysis['careerPaths'] = adapt_jsearch_to_career_path(job_results[1], 'internship', extracted_skills)
        print("--> Analysis and job search complete. Returning combined response.")
        return {"full_time_analysis": full_time_analysis, "internship_analysis": internship_analysis}
    except Exception as e:
        print(f"An unexpected error occurred during the main workflow: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An internal server error occurred during analysis.")

@app.post("/fetch-jobs/")
async def fetch_jobs_endpoint(request: JobSearchRequest):
    try:
        print(f"--> Received job search request for query: '{request.query}' and type: '{request.job_type}'")
        jobs_data = None
        if request.job_type == 'full-time':
            jobs_data = await fetch_fulltime_jobs_from_jsearch(request.query)
        else:
            jobs_data = await fetch_internships_from_jsearch(request.query)
            
        if jobs_data is None:
            raise HTTPException(status_code=503, detail="The job search service is currently unavailable.")

        query_as_skills = request.query.split()
        adapted_jobs = adapt_jsearch_to_career_path(jobs_data, request.job_type, query_as_skills)
        
        print(f"<-- Found and adapted {len(adapted_jobs)} jobs. Returning response.")
        return adapted_jobs
        
    except Exception as e:
        print(f"An error occurred in fetch_jobs_endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An internal server error occurred while fetching jobs.")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Elevate-AI Gemini Backend is running"}