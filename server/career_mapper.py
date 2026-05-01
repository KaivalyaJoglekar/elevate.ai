import re
from datetime import datetime, timezone
from typing import Iterable, List


STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into",
    "is", "it", "of", "on", "or", "that", "the", "to", "with", "using", "your",
    "you", "we", "our", "their", "role", "roles", "india", "fulltime", "full", "time",
    "internship", "internships", "remote", "onsite", "hybrid", "years", "year", "plus",
}

DISPLAY_ALIASES = {
    "ai": "AI",
    "api": "API",
    "aws": "AWS",
    "ci": "CI",
    "cd": "CD",
    "css": "CSS",
    "etl": "ETL",
    "gcp": "GCP",
    "git": "Git",
    "html": "HTML",
    "ios": "iOS",
    "java": "Java",
    "javascript": "JavaScript",
    "kpi": "KPI",
    "kpis": "KPIs",
    "llm": "LLM",
    "ml": "ML",
    "nlp": "NLP",
    "qa": "QA",
    "react": "React",
    "sql": "SQL",
    "ui": "UI",
    "ux": "UX",
}

INDIA_LOCATION_HINTS = {
    "india", "bengaluru", "bangalore", "hyderabad", "pune", "mumbai", "gurgaon",
    "gurugram", "noida", "delhi", "chennai", "kolkata", "ahmedabad",
}


def _tokenize(value: str | None) -> list[str]:
    tokens = re.findall(r"[A-Za-z][A-Za-z0-9+.#/-]{1,}", value or "")
    return [token.lower() for token in tokens if token.lower() not in STOPWORDS]


def _ordered_unique(values: Iterable[str]) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()
    for value in values:
        item = value.strip().lower()
        if not item or item in seen:
            continue
        seen.add(item)
        ordered.append(item)
    return ordered


def _display_skill(value: str) -> str:
    return DISPLAY_ALIASES.get(value.lower(), value.replace("-", " ").replace("_", " ").title())


def _overlap_ratio(left: set[str], right: set[str]) -> float:
    if not left or not right:
        return 0.0
    return len(left.intersection(right)) / len(left)


def _extract_job_terms(job: dict) -> tuple[set[str], set[str], set[str]]:
    title_terms = set(_tokenize(job.get("job_title")))
    description_terms = set(_tokenize(job.get("job_description")))
    location_terms = set(
        _tokenize(
            " ".join(
                str(part or "")
                for part in (
                    job.get("job_location"),
                    job.get("job_city"),
                    job.get("job_state"),
                    job.get("job_country"),
                )
            )
        )
    )
    return title_terms, description_terms, location_terms


def _location_bonus(job: dict) -> int:
    location_text = " ".join(
        str(part or "").lower()
        for part in (
            job.get("job_location"),
            job.get("job_city"),
            job.get("job_state"),
            job.get("job_country"),
        )
    )
    if job.get("job_is_remote"):
        return 6
    if any(hint in location_text for hint in INDIA_LOCATION_HINTS):
        return 8
    return 2 if not location_text.strip() else 0


def _recency_bonus(posted_at: str | None) -> int:
    if not posted_at:
        return 0
    normalized = posted_at.replace("Z", "+00:00")
    try:
        posted = datetime.fromisoformat(normalized)
    except ValueError:
        return 0
    if posted.tzinfo is None:
        posted = posted.replace(tzinfo=timezone.utc)
    age_days = max(0, (datetime.now(timezone.utc) - posted.astimezone(timezone.utc)).days)
    if age_days <= 3:
        return 8
    if age_days <= 7:
        return 6
    if age_days <= 14:
        return 4
    if age_days <= 30:
        return 2
    return 0


def _build_proficiency_analysis(skills: list[str], matched_skills: set[str], job_type: str) -> list[dict]:
    required_base = 74 if job_type == "full-time" else 58
    output: list[dict] = []
    for index, skill in enumerate(skills[:5]):
        is_matched = skill in matched_skills
        user_proficiency = 72 - (index * 4) if is_matched else 28 + (index * 6)
        required_proficiency = required_base + min(index * 2, 8)
        output.append(
            {
                "skill": _display_skill(skill),
                "userProficiency": max(10, min(92, user_proficiency)),
                "requiredProficiency": max(35, min(92, required_proficiency)),
            }
        )
    return output


def _trim_description(description: str | None) -> str:
    text = " ".join((description or "No description available.").split())
    if len(text) <= 140:
        return text
    return f"{text[:137].rstrip()}..."


def _build_match_rationale(matched_skills: list[str], job_type: str, location_bonus: int) -> str:
    parts: list[str] = []
    if matched_skills:
        parts.append(f"Strong overlap on {', '.join(_display_skill(skill) for skill in matched_skills[:3])}")
    if location_bonus >= 8:
        parts.append("aligned to the India job market")
    elif location_bonus >= 6:
        parts.append("remote-friendly opportunity")
    parts.append("scored for recruiter-facing role alignment")
    return f"{'; '.join(parts)} for {job_type} targeting."


def adapt_jsearch_to_career_path(jsearch_jobs: list, job_type: str, skills_query: List[str]) -> list:
    if not jsearch_jobs:
        return []

    query_terms = _ordered_unique(skills_query)
    query_skills_set = set(query_terms)
    career_paths = []

    for job in jsearch_jobs[:7]:
        title_terms, description_terms, location_terms = _extract_job_terms(job)
        job_terms = title_terms.union(description_terms).union(location_terms)

        relevant_skills = [skill for skill in query_terms if skill in job_terms][:5]
        matched_skills_set = set(relevant_skills)
        skills_to_develop = [
            skill
            for skill in _ordered_unique(sorted(title_terms) + sorted(description_terms))
            if skill not in query_skills_set and len(skill) > 2
        ][:5]

        title_overlap = _overlap_ratio(query_skills_set, title_terms)
        description_overlap = _overlap_ratio(query_skills_set, description_terms)
        skill_overlap = _overlap_ratio(query_skills_set, matched_skills_set)
        location_bonus = _location_bonus(job)
        recency_bonus = _recency_bonus(job.get("job_posted_at_datetime_utc"))
        employment_bonus = 4 if job_type == "internship" and "intern" in title_terms else 2

        match_pct = round(
            40
            + (skill_overlap * 28)
            + (title_overlap * 18)
            + (description_overlap * 12)
            + location_bonus
            + recency_bonus
            + employment_bonus
        )
        match_pct = max(35, min(97, match_pct))

        chart_skills = (relevant_skills + skills_to_develop)[:5]
        proficiency_analysis = _build_proficiency_analysis(chart_skills, matched_skills_set, job_type)

        career_paths.append({
            "role": job.get("job_title", "N/A"),
            "employer_name": job.get("employer_name", "N/A"),
            "employer_logo": job.get("employer_logo"),
            "description": _trim_description(job.get("job_description")),
            "job_link": job.get("job_apply_link", f"https://www.google.com/search?q={job.get('job_title', '')}"),
            "matchPercentage": match_pct,
            "job_city": job.get("job_city"),
            "job_state": job.get("job_state"),
            "job_country": job.get("job_country"),
            "job_location": job.get("job_location"),
            "job_is_remote": job.get("job_is_remote"),
            "job_employment_type": job.get("job_employment_type"),
            "job_posted_at_datetime_utc": job.get("job_posted_at_datetime_utc"),
            "relevantSkills": [{"name": _display_skill(skill)} for skill in relevant_skills[:5]],
            "skillsToDevelop": [{"name": _display_skill(skill)} for skill in skills_to_develop],
            "skillProficiencyAnalysis": proficiency_analysis,
            "matchRationale": _build_match_rationale(relevant_skills, job_type, location_bonus),
            "source": "jsearch",
            "market_region": "India",
        })

    return sorted(career_paths, key=lambda item: item["matchPercentage"], reverse=True)
