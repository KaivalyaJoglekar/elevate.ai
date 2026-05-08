import type { AnalysisStatusPayload, CareerPath, JobSearchType } from "@/types/analysis";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://elevate-ai-p0pn.onrender.com"
    : "http://127.0.0.1:8000")
).replace(/\/$/, "");

/** How long (ms) to wait for backend to wake up before submitting */
const WAKEUP_TIMEOUT_MS = 25_000;

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

/**
 * Pings /health until the backend responds (handles Render cold-start ~30s).
 * Resolves when healthy, rejects after WAKEUP_TIMEOUT_MS.
 */
export const warmupBackend = async (signal?: AbortSignal): Promise<void> => {
  const deadline = Date.now() + WAKEUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (signal?.aborted) return;
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return;
    } catch {
      // Ignore and retry
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  // Don't throw — let the actual request fail with a real error
};

export const submitAnalysis = async (
  formData: FormData,
  signal?: AbortSignal
): Promise<AnalysisStatusPayload> => {
  // Wake the Render instance before uploading (handles ~30s cold-start)
  await warmupBackend(signal);

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
