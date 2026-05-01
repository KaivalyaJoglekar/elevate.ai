export interface AtsScore {
  score: number;
  feedback: string;
  breakdown?: { label: string; score: number }[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  topIssues?: string[];
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
  employer_name?: string;
  employer_logo?: string | null;
  job_link?: string;
  description: string;
  matchPercentage: number;
  job_city?: string | null;
  job_state?: string | null;
  job_country?: string | null;
  job_location?: string | null;
  job_is_remote?: boolean | null;
  job_employment_type?: string | null;
  job_posted_at_datetime_utc?: string | null;
  matchRationale?: string;
  source?: string | null;
  market_region?: string | null;
  relevantSkills: Array<Skill | string>;
  skillsToDevelop: Array<Skill | string>;
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

export interface AnalysisResult {
  candidate_name: string;
  target_role: string;
  experience_level: string;
  resume_text_raw?: string;
  job_description_raw?: string;
  job_description_excerpt: string;
  resume_excerpt: string;
  parsing_method: string;
  full_time_query: string;
  internship_query: string;
  job_market_status: string;
  job_market_live?: boolean;
  full_time_job_count?: number;
  internship_job_count?: number;
  market_context?: {
    country_code: string;
    region_name: string;
    timezone: string;
    currency: string;
    job_source?: string;
  };
  analysis_metadata?: {
    backend_version?: string;
    generated_at_utc?: string;
    timings_ms?: {
      llm_analysis?: number;
      market_enrichment?: number;
      total?: number;
    };
  };
  quality_signals?: {
    resume_word_count?: number;
    job_description_present?: boolean;
    job_feed_mode?: string;
    market_region?: string;
  };
  full_time_analysis: CareerData;
  internship_analysis: CareerData;
}

export interface AnalysisStatusPayload {
  success: boolean;
  task_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  current_step: string;
  cached: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

export type AnalysisTrackKey = "full_time_analysis" | "internship_analysis";
export type JobSearchType = "full-time" | "internship";

export interface ResumeAnalysisContextType {
  isHydrated: boolean;
  taskId: string | null;
  setTaskId: (taskId: string | null) => void;
  analysisStatus: AnalysisStatusPayload | null;
  setAnalysisStatus: (analysisStatus: AnalysisStatusPayload | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  fileName: string | null;
  setFileName: (fileName: string | null) => void;
  file: File | null;
  setFile: (file: File | null) => void;
}
