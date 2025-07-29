
export const GEMINI_PROMPT_TEMPLATE = `
Analyze the following resume content carefully. The resume may contain information in various formats including:
- Tables with education/experience data
- Structured layouts with dates, positions, institutions
- Mixed text and tabular information
- Different formatting styles

Your goal is to act as an expert career coach and provide a detailed, structured analysis.
Return a single, valid JSON object without any markdown formatting (e.g., no \\\`\\\`\\\`json ... \\\`\\\`\\\`).

Your task is to accurately parse educational details including institution name, degree, GPA, and any relevant coursework from ANY format (text, tables, structured layouts).
interface AtsScore { score: number; feedback: string; }
interface Skill { name: string; }
interface SkillProficiency { skill: string; userProficiency: number; requiredProficiency: number; }
interface CareerPath {
  role: string;
  description: string;
  matchPercentage: number;
  relevantSkills: Skill[];
  skillsToDevelop: Skill[];
  skillProficiencyAnalysis: SkillProficiency[];
}
interface CareerData {
  name: string;
  summary: string;
  atsScore: AtsScore;
  extractedSkills: Skill[];
  experienceSummary: string[];
  educationSummary: string[];
  careerPaths: CareerPath[];
  generalResumeImprovements: string[];
  generalUpskillingSuggestions: string[];
}

Instructions:
1.  **name**: Extract the full name of the candidate from the resume. If no name is found, use "Valued Professional".
2.  **summary**: Write a 2-3 sentence professional summary based on the resume.
3.  **atsScore**:
    - **score**: An Applicant Tracking System (ATS) compatibility score (0-100). Higher means better structured and keyword-optimized.
    - **feedback**: One sentence of constructive feedback on the ATS score.
4.  **extractedSkills**: Extract a comprehensive list of all key technical and soft skills found in the resume. Return at least 10 skills.
5.  **experienceSummary**: Provide a bulleted list summarizing each major role from the work experience section. Each summary should be a concise string.
6.  **educationSummary**: Extract ONLY the exact education information from the resume. Do NOT modify, abbreviate, or assume anything:
    - Copy the EXACT degree name as written
    - Copy the EXACT institution name as written  
    - Copy the EXACT graduation date as written
    - Copy the EXACT GPA as written
    Example format: "B.Tech. in Computer Science - NMIMS Mukesh Patel School of Technology Management and Engineering Mumbai, India (Expected June 2027, GPA: 3.81/4.00)"
7.  **careerPaths**: Identify and analyze 10-12 highly relevant career paths. For each path:
    - **role**: The job title.
    - **description**: A brief, one-sentence description of why this role is a potential fit.
    - **matchPercentage**: A score (0-100) indicating how well the resume matches this role.
    - **relevantSkills**: List 4-5 key skills from the resume that are highly relevant to this role.
    - **skillsToDevelop**: List 2-3 crucial skills for this role that are missing or underdeveloped in the resume.
    - **skillProficiencyAnalysis**: For 5-7 core skills relevant to the role, provide a "userProficiency" (how good the user appears to be based on their resume) and a "requiredProficiency" (what's typically expected for the role), both on a 0-100 scale. The skills should be relevant to the role (e.g., 'React', 'Python', 'Agile', 'System Design', 'Communication').
8.  **generalResumeImprovements**: Provide 3 actionable, general tips to improve the resume content.
9.  **generalUpskillingSuggestions**: Suggest 3 general, actionable resources or topics for the candidate to learn.

Here is the resume content:
---
{resume_content}
---
`;