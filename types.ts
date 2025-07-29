// src/types.ts

// This represents a SINGLE analysis (either full-time or internship)
export interface AtsScore { score: number; feedback: string; }
export interface Skill { name: string; }
export interface SkillProficiency { skill: string; userProficiency: number; requiredProficiency: number; }
export interface CareerPath {
  role: string;
  employer_name: string;
  employer_logo?: string | null;
  job_link?: string;
  description: string;
  matchPercentage: number;
  relevantSkills: Skill[];
  skillsToDevelop: Skill[];
  skillProficiencyAnalysis: SkillProficiency[];
}
export interface CareerData {
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

// This is the top-level object our app will now use
export interface DualAnalysisData {
    full_time_analysis: CareerData;
    internship_analysis: CareerData;
}

// Update the context to use the new DualAnalysisData type
export interface ResumeAnalysisContextType {
  analysis: DualAnalysisData | null;
  setAnalysis: (analysis: DualAnalysisData | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  fileName: string | null;
  setFileName: (fileName: string | null) => void;
  file: File | null;
  setFile: (file: File | null) => void;
}