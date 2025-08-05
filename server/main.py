# server/main.py

import base64
import uvicorn
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal

from nlp_processor import (
    parse_pdf_text,
    extract_name,
    extract_skills,
    extract_section_content,
    generate_professional_summary,
    generate_dynamic_ats_score,
    analyze_skill_gap,
    generate_realtime_skill_proficiency,
    generate_dynamic_recommendations,
    calculate_keyword_similarity, 
    CORE_TECH_SKILLS
)
from api_clients import (
    fetch_fulltime_jobs_from_jsearch, 
    fetch_internships_from_jsearch, 
    RAPIDAPI_KEY
)

from datetime import datetime, timedelta
import traceback

api_cache = {}
CACHE_DURATION = timedelta(hours=6)

STATIC_FALLBACK_FULLTIME_JOBS = [
    {
        "job_title": "Software Engineer", "employer_name": "Tata Consultancy Services", "job_employment_type": "FULLTIME",
        "description": "Develop and maintain enterprise-level applications for global clients. Focus on robust architecture and scalable solutions.",
        "job_description": "As a Software Engineer at TCS, you will contribute to the full software development lifecycle. Strong knowledge of Java or Python, SQL, and cloud platforms is expected.",
        "employer_logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_NoAHz2kYn8A2aI0cM4aS84Zz2e-QnJ-1gA&s",
        "job_apply_link": "https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer%20Tata%20Consultancy%20Services&location=India"
    },
]

STATIC_FALLBACK_INTERNSHIPS = [
    {
        "job_title": "Software Engineer Intern", "employer_name": "Microsoft", "job_employment_type": "INTERN",
        "description": "Join a team of engineers to work on impactful projects, contributing to Microsoft's leading products and services.",
        "job_description": "This internship offers hands-on experience in software development. You will work with a mentor on a real-world project, gaining skills in C++, C#, Java, or other relevant technologies.",
        "employer_logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Xo0Q9y-p-sc_m2yL-YqGo-8s-0p_Y0gL4g&s",
        "job_apply_link": "https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer%20Intern%20Microsoft&location=India"
    },
]

async def get_api_data_with_cache(api_function, query: str):
    """Generic cache wrapper for our async API functions."""
    cache_key = f"{api_function.__name__}_{query or 'all'}"
    now = datetime.now()
    
    if cache_key in api_cache:
        timestamp, data = api_cache[cache_key]
        if now - timestamp < CACHE_DURATION:
            print(f"CACHE HIT for: {cache_key}")
            return data
            
    print(f"CACHE MISS for: {cache_key}. Fetching from live API.")
    data = await api_function(query)
    
    if data is not None:
        api_cache[cache_key] = (now, data)
    else:
        print(f"API call for {cache_key} failed or returned None. No data to cache.")
    return data


app = FastAPI(title="Elevate-AI Dual Analysis Backend")
origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "https://elevate-ai-five-psi.vercel.app" 
]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)


class ResumeRequest(BaseModel):
    file_content: str

class JobSearchRequest(BaseModel):
    query: str
    job_type: Literal['full-time', 'internship']

def create_analysis_for_type(resume_text: str, name: str, skills: list, job_listings: list, job_type: str) -> dict:
    experience_summary = extract_section_content(resume_text, "Experience")
    education_summary = extract_section_content(resume_text, "Education")
    professional_summary = generate_professional_summary(resume_text, skills, job_type)
    ats_score = generate_dynamic_ats_score(resume_text, skills, experience_summary, education_summary)
    
    career_paths = []
    if job_listings:
        job_descriptions = [job.get('job_description', '') for job in job_listings]
        similarity_scores = calculate_keyword_similarity(set(skills), job_descriptions)
        # MODIFIED: Removed the [:15] slice to process ALL jobs returned from the API.
        for i, job in enumerate(job_listings):
            if i < len(similarity_scores):
                skill_gap = analyze_skill_gap(set(skills), job_descriptions[i])
                job_title = job.get("job_title", "N/A")
                career_paths.append({
                    "role": job_title, 
                    "employer_name": job.get("employer_name", "N/A"),
                    "employer_logo": job.get("employer_logo"),
                    "job_link": job.get("job_apply_link") or f"https://www.google.com/search?q={job_title} {job.get('employer_name', '')}",
                    "description": (job.get("job_description") or "No description.")[:150] + "...",
                    "matchPercentage": int(round(similarity_scores[i] * 100)),
                    "relevantSkills": [{"name": s} for s in skill_gap["matching_skills"]],
                    "skillsToDevelop": [{"name": s} for s in skill_gap["missing_skills"]],
                    "skillProficiencyAnalysis": generate_realtime_skill_proficiency(
                        job_title, resume_text, 
                        [s['name'] for s in [{"name": s} for s in skill_gap["matching_skills"]][:4]] + 
                        [s['name'] for s in [{"name": s} for s in skill_gap["missing_skills"]][:3]], job_type
                    ),
                })
        career_paths.sort(key=lambda x: x["matchPercentage"], reverse=True)

    top_skills_to_develop = []
    if career_paths and career_paths[0].get('skillsToDevelop'):
        top_skills_to_develop = career_paths[0]['skillsToDevelop']
        
    improvements, upskilling = generate_dynamic_recommendations(skills, top_skills_to_develop, job_type)

    return {
        "name": name, "summary": professional_summary, "atsScore": ats_score,
        "extractedSkills": [{"name": s} for s in skills],
        "experienceSummary": experience_summary, "educationSummary": education_summary,
        "careerPaths": career_paths, "generalResumeImprovements": improvements,
        "generalUpskillingSuggestions": upskilling,
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
        name = extract_name(resume_text)
        skills = extract_skills(resume_text)
        if not skills: raise ValueError("No skills found.")

        full_time_jobs = None
        internship_jobs = None
        
        if RAPIDAPI_KEY:
            search_terms = prioritized_skills[:2] if (prioritized_skills := [s for s in skills if s in CORE_TECH_SKILLS]) else skills[:2]
            if not search_terms: search_terms.append("Software Engineer")
            primary_query = " ".join(search_terms)
            
            print("--- Starting concurrent JSearch API calls ---")
            results = await asyncio.gather(
                get_api_data_with_cache(fetch_fulltime_jobs_from_jsearch, primary_query),
                get_api_data_with_cache(fetch_internships_from_jsearch, primary_query)
            )
            print("--- Concurrent API calls finished ---")
            full_time_jobs, internship_jobs = results
        
        if not full_time_jobs:
            print("No live full-time jobs found or API failed. Using static fallbacks.")
            full_time_jobs = STATIC_FALLBACK_FULLTIME_JOBS
        if not internship_jobs:
            print("No live internships found or API failed. Using static fallbacks.")
            internship_jobs = STATIC_FALLBACK_INTERNSHIPS

        full_time_analysis = create_analysis_for_type(resume_text, name, skills, full_time_jobs, 'full-time')
        internship_analysis = create_analysis_for_type(resume_text, name, skills, internship_jobs, 'internship')

        return {"full_time_analysis": full_time_analysis, "internship_analysis": internship_analysis}

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"An unexpected error occurred during analysis: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An internal error occurred during analysis.")

@app.post("/fetch-jobs/")
async def fetch_jobs_endpoint(request: JobSearchRequest):
    try:
        if request.job_type == 'full-time':
            jobs = await fetch_fulltime_jobs_from_jsearch(request.query)
        else: # 'internship'
            jobs = await fetch_internships_from_jsearch(request.query)
        
        if jobs is None:
            raise HTTPException(status_code=500, detail="Failed to fetch jobs from the external API.")
        
        # Adapt the raw data to the CareerPath structure the frontend expects
        adapted_jobs = []
        for job in jobs:
            adapted_jobs.append({
                "role": job.get("job_title"),
                "employer_name": job.get("employer_name"),
                "employer_logo": job.get("employer_logo"),
                "job_link": job.get("job_apply_link"),
                "description": (job.get("job_description") or "No description available.")[:150] + "...",
                # Set defaults for fields that are calculated during the initial analysis
                "matchPercentage": 0, 
                "relevantSkills": [],
                "skillsToDevelop": [],
                "skillProficiencyAnalysis": []
            })
        return adapted_jobs

    except Exception as e:
        print(f"An error occurred in /fetch-jobs/: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An internal error occurred while fetching jobs.")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Elevate-AI Backend is running"}