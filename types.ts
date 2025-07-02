export interface AtsScore {
  score: number;
  feedback: string;
}

export interface Skill {
  name: string;
}

export interface SkillProficiency {
    skill: string;
    userProficiency: number;
    requiredProficiency: number;
}

export interface CareerPath {
  role: string;
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

export interface ResumeAnalysisContextType {
  analysis: CareerData | null;
  setAnalysis: (analysis: CareerData | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  fileName: string | null;
  setFileName: (fileName: string | null) => void;
  file: File | null;
  setFile: (file: File | null) => void;
}