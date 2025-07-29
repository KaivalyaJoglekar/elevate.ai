// services/backendService.ts

import type { DualAnalysisData } from '../types';

// This will use the URL we set on Vercel during deployment.
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export const analyzeResume = async (
  fileContent: string,
): Promise<DualAnalysisData> => {
  try {
    const response = await fetch(`${BACKEND_URL}/analyze-resume-dual/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_content: fileContent }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server error (${response.status})`);
    }

    const data = await response.json();
    return data as DualAnalysisData;
  } catch (error) {
    console.error('Failed to analyze resume via backend:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Could not connect to the backend server.');
    }
    if (error instanceof Error) { throw error; }
    throw new Error('An unexpected error occurred while analyzing the resume.');
  }
};