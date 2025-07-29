import { GoogleGenAI } from "@google/genai";
import { GEMINI_PROMPT_TEMPLATE } from '../constants';
import type { CareerData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeResume = async (
  fileContent: string
): Promise<CareerData> => {
  const prompt = GEMINI_PROMPT_TEMPLATE.replace('{resume_content}', fileContent);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as CareerData;
    return parsedData;

  } catch (error) {
    console.error("Error analyzing resume with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze resume. Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing the resume.");
  }
};