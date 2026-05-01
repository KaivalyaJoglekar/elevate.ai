"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AnalysisStatusPayload, ResumeAnalysisContextType } from "@/types/analysis";

const ResumeAnalysisContext = createContext<ResumeAnalysisContextType | undefined>(undefined);
const STORAGE_KEY = "elevate:last-analysis";

interface PersistedAnalysisState {
  taskId: string | null;
  analysisStatus: AnalysisStatusPayload | null;
  fileName: string | null;
}

export function ResumeAnalysisProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatusPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawState = window.localStorage.getItem(STORAGE_KEY);
      if (!rawState) {
        return;
      }

      const parsedState = JSON.parse(rawState) as PersistedAnalysisState;
      setTaskId(parsedState.taskId ?? null);
      setAnalysisStatus(parsedState.analysisStatus ?? null);
      setFileName(parsedState.fileName ?? null);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    const nextState: PersistedAnalysisState = {
      taskId,
      analysisStatus,
      fileName,
    };

    const hasPersistedData = Boolean(taskId || analysisStatus || fileName);
    if (!hasPersistedData) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [analysisStatus, fileName, isHydrated, taskId]);

  return (
    <ResumeAnalysisContext.Provider
      value={{
        isHydrated,
        taskId,
        setTaskId,
        analysisStatus,
        setAnalysisStatus,
        isLoading,
        setIsLoading,
        error,
        setError,
        fileName,
        setFileName,
        file,
        setFile,
      }}
    >
      {children}
    </ResumeAnalysisContext.Provider>
  );
}

export function useResumeContext() {
  const context = useContext(ResumeAnalysisContext);
  if (!context) {
    throw new Error("useResumeContext must be used within a ResumeAnalysisProvider");
  }
  return context;
}
