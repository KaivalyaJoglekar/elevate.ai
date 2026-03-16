import random
import re
from typing import List


def adapt_jsearch_to_career_path(jsearch_jobs: list, job_type: str, skills_query: List[str]) -> list:
    if not jsearch_jobs:
        return []

    query_skills_set = {skill.lower() for skill in skills_query if skill}
    career_paths = []

    for job in jsearch_jobs[:7]:
        job_desc = (job.get("job_description") or "").lower()
        job_words = set(re.findall(r"\b\w+\b", job_desc))

        relevant_skills = list(query_skills_set.intersection(job_words))
        skills_to_develop = [skill for skill in job_words.difference(query_skills_set) if len(skill) > 3][:5]

        if query_skills_set:
            base_match = int((len(relevant_skills) / len(query_skills_set)) * 100)
        else:
            base_match = 0

        match_pct = min(base_match + random.randint(30, 50), 95)

        chart_skills = (relevant_skills + skills_to_develop)[:5]
        proficiency_analysis = [
            {
                "skill": skill.capitalize(),
                "userProficiency": random.randint(60, 85) if skill in relevant_skills else random.randint(10, 30),
                "requiredProficiency": random.randint(65, 80) if job_type == 'full-time' else random.randint(45, 60),
            }
            for skill in chart_skills
        ]

        career_paths.append({
            "role": job.get("job_title", "N/A"),
            "employer_name": job.get("employer_name", "N/A"),
            "employer_logo": job.get("employer_logo"),
            "description": (job.get("job_description") or "No description available.")[:120] + "…",
            "job_link": job.get("job_apply_link", f"https://www.google.com/search?q={job.get('job_title', '')}"),
            "matchPercentage": match_pct,
            "relevantSkills": [{"name": skill.capitalize()} for skill in relevant_skills[:5]],
            "skillsToDevelop": [{"name": skill.capitalize()} for skill in skills_to_develop],
            "skillProficiencyAnalysis": proficiency_analysis,
        })

    return sorted(career_paths, key=lambda item: item["matchPercentage"], reverse=True)
