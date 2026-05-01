import type { AnalysisStatusPayload, CareerPath, JobSearchType } from "@/types/analysis";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const parseError = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    if (payload?.detail) return String(payload.detail);
    if (payload?.message) return String(payload.message);
    if (payload?.error?.message) return String(payload.error.message);
  } catch {
    // Ignore JSON parse failures.
  }

  return `Server error (${response.status})`;
};

export const submitAnalysis = async (
  formData: FormData,
  signal?: AbortSignal
): Promise<AnalysisStatusPayload> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AnalysisStatusPayload;
};

export const fetchAnalysisStatus = async (
  taskId: string,
  signal?: AbortSignal
): Promise<AnalysisStatusPayload> => {
  const response = await fetch(`${API_BASE_URL}/api/analysis/${taskId}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AnalysisStatusPayload;
};

export const fetchJobs = async (
  query: string,
  jobType: JobSearchType,
  signal?: AbortSignal
): Promise<CareerPath[]> => {
  const response = await fetch(`${API_BASE_URL}/fetch-jobs/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      job_type: jobType,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as CareerPath[];
};

export const retargetExistingAnalysis = async (
  taskId: string,
  payload: {
    target_role: string;
    experience_level: string;
    job_description: string;
  },
  signal?: AbortSignal
): Promise<AnalysisStatusPayload> => {
  const response = await fetch(`${API_BASE_URL}/api/re-target/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AnalysisStatusPayload;
};
