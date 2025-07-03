import type { CareerData } from '../types';

// Remove trailing slash to avoid double slashes
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

export const analyzeResume = async (
  fileContent: string
): Promise<CareerData> => {
  try {
    console.log('Sending resume analysis request...');
    
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
      
      // Handle specific error types
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait 15 minutes before trying again.');
      } else if (response.status === 422) {
        throw new Error('The AI service returned an invalid response. Please try uploading your resume again.');
      } else if (response.status === 400) {
        throw new Error('Invalid file content. Please ensure your resume is properly formatted.');
      }
      
      throw new Error(errorData.error || `Server error (${response.status}). Please try again.`);
    }

    const data = await response.json();
    
    // Validate the response structure
    if (!data.name || !data.summary || !data.atsScore) {
      throw new Error('Received incomplete analysis data. Please try again.');
    }
    
    console.log('Resume analysis completed successfully');
    return data as CareerData;

  } catch (error) {
    console.error('Failed to analyze resume via backend:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
    
    throw new Error('An unexpected error occurred while analyzing the resume.');
  }
};
