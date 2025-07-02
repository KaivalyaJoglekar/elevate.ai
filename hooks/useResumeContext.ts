
import { createContext, useContext } from 'react';
import type { ResumeAnalysisContextType } from '../types';

export const ResumeAnalysisContext = createContext<ResumeAnalysisContextType | undefined>(undefined);

export const useResumeContext = () => {
  const context = useContext(ResumeAnalysisContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeAnalysisProvider');
  }
  return context;
};
