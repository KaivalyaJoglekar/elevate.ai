import type { CareerData } from '../types';

// Remove trailing slash to avoid double slashes
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

// Temporary debugging
console.log('🔍 Debug Info:');
console.log('- Original env var:', import.meta.env.VITE_BACKEND_URL);
console.log('- Cleaned Backend URL:', BACKEND_URL);
console.log('- Environment Mode:', import.meta.env.MODE);

export const analyzeResume = async (
  fileContent: string
): Promise<CareerData> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/analyze-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileContent
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as CareerData;

  } catch (error) {
    console.error('Failed to analyze resume via backend:', error);
    if (error instanceof Error) {
      throw new Error(`Backend Analysis Error: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while analyzing the resume.');
  }
};
