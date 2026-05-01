// ==========================================
// Constants
// ==========================================

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
};

export const PROCESSING_STEPS = [
  { label: "Reading document", duration: 2000 },
  { label: "Extracting career signals", duration: 3000 },
  { label: "Running ATS diagnostics", duration: 4000 },
  { label: "Mapping skill gaps", duration: 3000 },
  { label: "Preparing dashboard", duration: 2000 },
];

export const SCORE_THRESHOLDS = {
  excellent: 85,
  good: 70,
  fair: 50,
} as const;
