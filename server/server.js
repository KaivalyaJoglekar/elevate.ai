import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://elevate-ai-zeta.vercel.app',
    'https://elevateai-production.up.railway.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 files

// Rate limiting to prevent API quota exhaustion
const analyzeResumeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many resume analysis requests. Please try again in 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY environment variable not set');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Simple in-memory cache to reduce duplicate API calls
const analysisCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Helper function to generate a hash for cache key
const generateCacheKey = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

// Clean expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of analysisCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      analysisCache.delete(key);
      console.log(`Cache entry ${key} expired and removed.`);
    }
  }
}, 10 * 60 * 1000); // Clean every 10 minutes

// --- PROMPT UPDATED AS PER YOUR REQUEST ---
const GEMINI_PROMPT_TEMPLATE = `
Analyze the following resume content carefully. The resume may contain information in various formats including:
- Tables with education/experience data
- Structured layouts with dates, positions, institutions
- Mixed text and tabular information
- Different formatting styles

Your goal is to act as an expert career coach and provide a detailed, structured analysis.
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
5.  **experienceSummary**: CRITICAL - Extract ALL work experience from the resume:
    
    SEARCH STRATEGY:
    - Look for sections: "Experience", "Work Experience", "Professional Experience", "Employment History", "Career"
    - Find job titles, company names, employment dates, responsibilities
    - Look for internships, part-time jobs, freelance work, projects
    
    EXTRACTION REQUIREMENTS:
    - Each entry should include: Job Title, Company Name, Duration, Key responsibilities
    - Format: "Job Title at Company Name (Start Date - End Date): Key achievements and responsibilities"
    - If dates are ranges like "2020-2023" or "Jan 2020 - Dec 2023", use exact format from resume
    - Include ALL positions found, even short-term or part-time roles
    - If no experience section exists, return empty array []
    
    Example outputs:
    - "Software Engineer at Google (2020-2023): Developed scalable web applications, led team of 5 engineers"
    - "Marketing Intern at Startup Inc (Summer 2019): Created social media campaigns, increased engagement by 40%"
6.  **educationSummary**: 🚨 CRITICAL - REAL EDUCATION DATA ONLY 🚨
    
    ⚠️ WARNING: You are being tested. Using fake data will result in immediate failure.
    
    STEP-BY-STEP EXTRACTION:
    1. SCAN the entire resume for education-related text
    2. IDENTIFY actual institution names (Stanford, MIT, Harvard, local colleges, etc.)
    3. FIND actual degree names (Bachelor of Arts, Master of Science, etc.)
    4. LOCATE actual graduation years (2019, 2023, Expected 2025, etc.)
    5. DISCOVER actual GPA if mentioned (3.7, 8.2/10, 85%, etc.)
    
    ABSOLUTE PROHIBITIONS:
    🚫 DO NOT invent institution names (e.g., "Tech University," "Anytown College") if they are not in the resume.
    🚫 DO NOT invent degree names (e.g., "B.Tech. in Fictional Studies") unless written exactly as it appears.
    🚫 DO NOT invent graduation dates (e.g., "Expected June 2027") unless the date is present in the text.
    🚫 DO NOT invent GPA scores (e.g., "GPA: 3.8/4.0") if one is not explicitly mentioned.
    🚫 DO NOT fabricate ANY part of the education information. You must only extract what is there.
    🚫 DO NOT use these examples or any previous outputs as a template for the current resume.
    
    VALIDATION CHECKLIST:
    ✅ Did I find actual university/college names in the resume text?
    ✅ Did I extract the exact degree name as written?
    ✅ Did I copy the exact graduation date format?
    ✅ Did I preserve the original GPA scale and format?
    ✅ Am I providing only information that exists in this specific resume?
    
    OUTPUT FORMATS:
    - Found education: ["Bachelor of Arts in Psychology, University of California Berkeley, 2021, GPA: 3.6"]
    - No education found: []
    
    REMEMBER: Extract ONLY what you can actually see in the resume text. No assumptions, no placeholders, no made-up data.
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

// Simple counters for monitoring
let apiCallCount = 0;
let cacheHitCount = 0;
let errorCount = 0;

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Monitoring endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    cacheSize: analysisCache.size,
    apiCalls: apiCallCount,
    cacheHits: cacheHitCount,
    errors: errorCount,
    cacheHitRate: (apiCallCount + cacheHitCount) > 0 ? ((cacheHitCount / (apiCallCount + cacheHitCount)) * 100).toFixed(2) + '%' : '0%',
    uptime: process.uptime()
  });
});

// Helper function to analyze resume with retry logic
const analyzeResumeWithRetry = async (prompt, maxRetries = 3) => {
  let attempts = 0;
  let delay = 1000; // Initial delay in ms
  
  while (attempts < maxRetries) {
    try {
      console.log(`Attempt ${attempts + 1} to analyze resume...`);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-05-20", // Using the requested 2.5 flash preview model
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      let jsonStr = response.text.trim();
      // Regular expression to find and extract JSON content from within markdown fences
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedData = JSON.parse(jsonStr);
      
      // Validate that the response contains essential fields
      if (!parsedData.name || !parsedData.summary || !parsedData.atsScore) {
        throw new Error('Invalid response format from AI: Missing essential fields.');
      }
      
      // Ensure educationSummary is always an array
      if (!Array.isArray(parsedData.educationSummary)) {
        parsedData.educationSummary = [];
      }
      
      console.log(`Resume analysis successful on attempt ${attempts + 1}`);
      return parsedData;
      
    } catch (error) {
      attempts++;
      console.warn(`Attempt ${attempts} failed: ${error.message}`);
      
      if (attempts >= maxRetries) {
        throw error;
      }
      
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff for retries
    }
  }
};

app.post('/api/analyze-resume', analyzeResumeRateLimit, async (req, res) => {
  try {
    const { fileContent } = req.body;

    if (!fileContent) {
      return res.status(400).json({ 
        error: 'File content is required' 
      });
    }

    // Generate a cache key from the resume content
    const cacheKey = generateCacheKey(fileContent);
    // Check if a valid analysis already exists in the cache
    if (analysisCache.has(cacheKey)) {
      cacheHitCount++;
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.json(analysisCache.get(cacheKey).data);
    }
    
    // If not in cache, proceed with new analysis
    console.log(`Cache miss. Processing new resume analysis request at ${new Date().toISOString()}`);
    
    const prompt = GEMINI_PROMPT_TEMPLATE.replace('{resume_content}', fileContent);
    
    const parsedData = await analyzeResumeWithRetry(prompt);
    apiCallCount++;
    
    console.log(`Fresh analysis completed successfully`);
    
    // Store the new analysis in the cache
    analysisCache.set(cacheKey, {
      timestamp: Date.now(),
      data: parsedData
    });
    
    res.json(parsedData);

  } catch (error) {
    errorCount++; // Increment error counter
    console.error('Final error analyzing resume:', error?.message || error);
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'API quota exceeded or rate limit hit. Please try again later.' 
      });
    }
    
    // Check specifically for JSON parsing errors
    if (error instanceof SyntaxError) {
      return res.status(422).json({ 
        error: 'The AI returned an invalid or malformed format. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: `Failed to analyze resume: ${error.message || 'An unknown error occurred'}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});