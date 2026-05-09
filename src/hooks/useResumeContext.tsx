"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AnalysisStatusPayload, ResumeAnalysisContextType } from "@/types/analysis";

const ResumeAnalysisContext = createContext<ResumeAnalysisContextType | undefined>(undefined);
const STORAGE_KEY = "elevate:last-analysis";

interface PersistedAnalysisState {
  taskId: string | null;
  analysisStatus: AnalysisStatusPayload | null;
}

export function ResumeAnalysisProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatusPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const persistedTaskId = parsedState.taskId ?? null;
      const persistedAnalysisStatus =
        parsedState.analysisStatus && parsedState.analysisStatus.task_id === persistedTaskId
          ? parsedState.analysisStatus
          : null;

      setTaskId(persistedTaskId);
      setAnalysisStatus(persistedAnalysisStatus);
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
      analysisStatus: analysisStatus?.task_id === taskId ? analysisStatus : null,
    };

    const hasPersistedData = Boolean(taskId || nextState.analysisStatus);
    if (!hasPersistedData) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [analysisStatus, isHydrated, taskId]);

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
