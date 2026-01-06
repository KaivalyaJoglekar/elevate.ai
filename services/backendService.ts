// services/backendService.ts

import type { DualAnalysisData, CareerPath } from '../types';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export const analyzeResume = async (
  fileContent: string,
  signal?: AbortSignal
): Promise<DualAnalysisData> => {
  try {
    const response = await fetch(`${BACKEND_URL}/analyze-resume-dual/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_content: fileContent }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server error (${response.status})`);
    }

    return await response.json() as DualAnalysisData;
  } catch (error) {
    console.error('Failed to analyze resume via backend:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Could not connect to the backend server.');
    }
    if (error instanceof Error) { throw error; }
    throw new Error('An unexpected error occurred while analyzing the resume.');
  }
};

export const fetchJobsByQuery = async (
  query: string,
  job_type: 'full-time' | 'internship'
): Promise<CareerPath[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/fetch-jobs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, job_type }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server error (${response.status})`);
    }
    
    return await response.json() as CareerPath[];

  } catch (error) {
    console.error('Failed to fetch jobs by query:', error);
    return []; // Return an empty array on failure so the UI doesn't crash
  }
};