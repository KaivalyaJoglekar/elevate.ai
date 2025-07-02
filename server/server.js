import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Default Vite dev server port
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 files

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY environment variable not set');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Constants - using the same prompt template as the frontend
const GEMINI_PROMPT_TEMPLATE = `
Analyze the following resume content. Your goal is to act as an expert career coach and provide a detailed, structured analysis.
Return a single, valid JSON object without any markdown formatting (e.g., no \\\`\\\`\\\`json ... \\\`\\\`\\\`).

The JSON object must conform to this TypeScript interface:
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
6.  **educationSummary**: Provide a bulleted list summarizing the education section (e.g., "B.S. in Computer Science - University of Technology").
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

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/analyze-resume', async (req, res) => {
  try {
    const { fileContent } = req.body;

    if (!fileContent) {
      return res.status(400).json({ 
        error: 'File content is required' 
      });
    }

    const prompt = GEMINI_PROMPT_TEMPLATE.replace('{resume_content}', fileContent);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);
    res.json(parsedData);

  } catch (error) {
    console.error('Error analyzing resume with Gemini API:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: `Failed to analyze resume. Gemini API Error: ${error.message}` 
      });
    } else {
      res.status(500).json({ 
        error: 'An unknown error occurred while analyzing the resume.' 
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
