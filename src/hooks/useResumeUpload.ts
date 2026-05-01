"use client";

import { useState, useCallback } from "react";
import { submitAnalysis } from "@/lib/api";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/constants";
import type { AnalysisStatusPayload } from "@/types/analysis";

interface UseResumeUploadReturn {
  file: File | null;
  isDragging: boolean;
  error: string | null;
  isLoading: boolean;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleAnalyze: (options?: {
    targetRole?: string;
    experienceLevel?: string;
    jobDescription?: string;
  }) => Promise<AnalysisStatusPayload | null>;
  setError: (error: string | null) => void;
}

export function useResumeUpload(): UseResumeUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = useCallback((f: File): string | null => {
    if (f.size > MAX_FILE_SIZE_BYTES) {
      return `File is too large. Please upload a file under ${MAX_FILE_SIZE_MB}MB.`;
    }
    const validTypes = ["application/pdf"];
    if (!validTypes.includes(f.type) && !f.name.toLowerCase().endsWith(".pdf")) {
      return "Invalid file type. Please upload a PDF resume.";
    }
    return null;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;

      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(droppedFile);
    },
    [validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(selectedFile);
    },
    [validateFile]
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(
    async (options?: {
      targetRole?: string;
      experienceLevel?: string;
      jobDescription?: string;
    }): Promise<AnalysisStatusPayload | null> => {
      if (!file) return null;

      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        if (options?.targetRole?.trim()) {
          formData.append("target_role", options.targetRole.trim());
        }
        if (options?.experienceLevel?.trim()) {
          formData.append("experience_level", options.experienceLevel.trim());
        }
        if (options?.jobDescription?.trim()) {
          formData.append("job_description", options.jobDescription.trim());
        }

        return await submitAnalysis(formData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [file]
  );

  return {
    file,
    isDragging,
    error,
    isLoading,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    handleRemoveFile,
    handleAnalyze,
    setError,
  };
}
