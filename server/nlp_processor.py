import fitz
# MODIFIED: Removed sentence-transformers to prevent memory overload.
# from sentence_transformers import SentenceTransformer, util 
import re
from datetime import datetime

# MODIFIED: Removed the model loading logic entirely to save memory.
# model = None
# def get_model():
#    ...

SKILLS_DB = [
    'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'sql', 'nosql', 'mongodb', 'postgresql',
    'react', 'angular', 'vue.js', 'next.js', 'nodejs', 'express.js', 'fastapi', 'django', 'flask',
    'machine learning', 'deep learning', 'nlp', 'natural language processing', 'computer vision',
    'data analysis', 'data science', 'pandas', 'numpy', 'scikit-learn', 'matplotlib',
    'tensorflow', 'pytorch', 'keras', 'aws', 'azure', 'google cloud', 'gcp', 'docker',
    'kubernetes', 'ci/cd', 'jenkins', 'git', 'github', 'agile', 'scrum', 'jira',
    'project management', 'product management', 'communication', 'teamwork', 'leadership', 'flutter',
    'dart', 'firebase', 'restful apis', 'graphql', 'kafka', 'data structures', 'algorithms',
    'problem-solving', 'adaptability', 'solidity', 'bloc'
]
CORE_TECH_SKILLS = [
    'python', 'java', 'c++', 'javascript', 'typescript', 'sql', 'react', 'angular', 'vue.js',
    'next.js', 'nodejs', 'django', 'flask', 'fastapi', 'machine learning', 'aws', 'azure',
    'docker', 'kubernetes', 'flutter', 'swift', 'kotlin'
]

def parse_pdf_text(pdf_content: bytes) -> str:
    with fitz.open(stream=pdf_content, filetype="pdf") as doc: return "".join(page.get_text() for page in doc)

def extract_name(text: str) -> str:
    match = re.search(r'^\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)', text)
    return match.group(1).strip() if match else "Valued Professional"

def extract_skills(text: str) -> list:
    skill_pattern = r'\b(' + '|'.join(re.escape(skill) for skill in SKILLS_DB) + r')\b'
    found_skills = re.findall(skill_pattern, text.lower(), re.IGNORECASE)
    return sorted(list(set(skill.lower() for skill in found_skills)))

# ✅ FIXED: Replaced memory-intensive semantic similarity with a lightweight keyword-based approach.
def calculate_keyword_similarity(resume_skills_set: set, job_descriptions: list[str]) -> list[float]:
    """Calculates similarity based on shared keywords to avoid memory crashes."""
    scores = []
    for desc in job_descriptions:
        job_skills_set = set(extract_skills(desc))
        
        if not resume_skills_set and not job_skills_set:
            scores.append(0.0)
            continue
        
        intersection = len(resume_skills_set.intersection(job_skills_set))
        union = len(resume_skills_set.union(job_skills_set))
        
        if union == 0:
            scores.append(0.0)
        else:
            # Using Jaccard similarity
            jaccard_score = intersection / union
            # Scale score to be more intuitive, similar to original range
            scaled_score = min(0.50 + (jaccard_score * 0.49), 0.99)
            scores.append(scaled_score)
            
    return scores


def analyze_skill_gap(resume_skills: set, job_description_text: str) -> dict:
    job_skills_set = set(extract_skills(job_description_text))
    matching_skills = list(resume_skills.intersection(job_skills_set))
    missing_skills = list(job_skills_set.difference(resume_skills))
    return {"matching_skills": matching_skills, "missing_skills": missing_skills}

def extract_section_content(text: str, section_title: str) -> list[str]:
    try:
        section_pattern = re.compile(r'^\s*' + section_title + r'\s*$', re.IGNORECASE | re.MULTILINE)
        match = section_pattern.search(text)
        if not match: return []
        start_index = match.end()
        section_text = text[start_index:]
        next_headers = ['education', 'experience', 'skills', 'projects', 'certifications', 'awards']
        if section_title.lower() in next_headers: next_headers.remove(section_title.lower())
        end_index = len(section_text)
        for header in next_headers:
            next_match = re.search(r'^\s*' + header + r'\s*$', section_text, re.IGNORECASE | re.MULTILINE)
            if next_match: end_index = min(end_index, next_match.start())
        section_content = section_text[:end_index].strip()
        return [line.strip() for line in section_content.split('\n') if len(line.strip()) > 25]
    except Exception:
        return []

def generate_realtime_skill_proficiency(job_title: str, resume_text: str, skills_for_chart: list, job_type: str) -> list:
    analysis = []
    is_senior = any(keyword in job_title.lower() for keyword in ['senior', 'lead', 'manager'])
    for skill_name in skills_for_chart:
        mentions = resume_text.lower().count(skill_name.lower())
        user_proficiency = min(40 + (mentions * 15), 90)
        if job_type == 'internship':
            required_proficiency = 60
        else:
            required_proficiency = 85 if is_senior else 70
        analysis.append({
            "skill": skill_name.title(),
            "userProficiency": user_proficiency,
            "requiredProficiency": required_proficiency
        })
    return analysis

def generate_professional_summary(text: str, skills: list, job_type: str) -> str:
    if not skills or len(skills) < 3:
        skills.extend(['valuable skills'] * (3 - len(skills)))
    if job_type == 'internship':
        return f"An aspiring professional eager to apply a strong academic foundation and skills in {skills[0]}, {skills[1]}, and {skills[2]} to a challenging internship."
    else:
        experience_years_text = "several"
        years = [int(y) for y in re.findall(r'\b(20\d{2})\b', text) if int(y) <= datetime.now().year]
        if years:
            experience_years = datetime.now().year - min(years)
            if experience_years > 0: experience_years_text = str(experience_years)
        return f"A results-oriented professional with ~{experience_years_text} years of experience, demonstrating expertise in {skills[0]}, {skills[1]}, and {skills[2]}."

def generate_dynamic_ats_score(text: str, skills: list, experience: list, education: list) -> dict:
    score, feedback = 40, "ATS analysis: "
    if len(skills) > 10: score += 20
    if experience: score += 15
    if education: score += 10
    if any(v in text.lower() for v in ['developed', 'led', 'managed', 'created']): score += 10
    if re.search(r'\d+%', text): score += 5
    final_score = min(score, 95)
    if final_score > 85:
        feedback += "Excellent keyword and section formatting."
    elif final_score > 65:
        feedback += "Good structure. Could be enhanced with more quantifiable results."
    else:
        feedback += "Consider adding more specific skills and using stronger action verbs."
    return {"score": final_score, "feedback": feedback}

def generate_dynamic_recommendations(skills: list, skill_gap: list, job_type: str) -> tuple[list, list]:
    if job_type == 'internship':
        improvements = [
            "Highlight academic projects, coursework, and personal projects to showcase your skills and initiative.",
            "Create a 'Core Competencies' section at the top to immediately show recruiters your key technical skills.",
            "Clearly state your availability (e.g., 'Available Summer 2025') and graduation date."
        ]
    else:
        improvements = [
            "Quantify achievements with metrics (e.g., 'Increased user engagement by 15%') to showcase tangible impact.",
            "Ensure your most recent and relevant experience is detailed at the top of the experience section.",
            f"Tailor your summary to align with senior roles, emphasizing leadership and your expertise in {skills[1] if len(skills) > 1 else 'key areas'} and {skills[2] if len(skills) > 2 else 'related fields'}."
        ]
    upskilling = [f"Deepen your expertise in '{skill_gap[0]}'."] if skill_gap else []
    upskilling.append("Explore cloud technologies (AWS, Azure) as they are valuable at all experience levels.")
    upskilling.append("Contribute to an open-source project to build a public portfolio.")
    return improvements, upskilling