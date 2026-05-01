"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, ArrowRight, Loader2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { useRef } from "react";

interface ResumeUploadConsoleProps {
  file: File | null;
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onAnalyze: () => void;
}

export default function ResumeUploadConsole({
  file,
  isDragging,
  isLoading,
  error,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onRemoveFile,
  onAnalyze,
}: ResumeUploadConsoleProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full"
    >
      {/* Console header */}
      <div className="glass-card rounded-b-none border-b-0 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-ev-text-muted/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-ev-text-muted/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-ev-text-muted/30" />
          </div>
          <span className="section-label ml-3">Resume Scanner</span>
        </div>
      </div>

      {/* Console body */}
      <div className="glass-card rounded-t-none px-6 py-8">
        <h3 className="font-display text-xl font-bold text-ev-text mb-1">
          Upload your resume
        </h3>
        <p className="text-sm text-ev-text-muted mb-6">
          PDF up to 5MB
        </p>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center py-10 px-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
            isDragging
              ? "border-ev-gold/60 bg-ev-gold/5 scale-[1.02]"
              : file
                ? "border-ev-gold/30 bg-ev-gold/5"
                : "border-ev-border hover:border-ev-border-strong hover:bg-white/[0.02]"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={onFileSelect}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-ev-gold/10 border border-ev-gold/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-ev-gold" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-ev-text">{file.name}</p>
                  <p className="text-xs text-ev-text-muted mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile();
                  }}
                  className="flex items-center gap-1 text-xs text-ev-text-muted hover:text-red-400 transition-colors mt-1"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-ev-border flex items-center justify-center">
                  <Upload className="w-5 h-5 text-ev-text-muted" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-ev-text-secondary">
                    Drop your resume here or{" "}
                    <span className="text-ev-gold font-medium">browse files</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <p className="text-xs text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze button */}
        <motion.button
          onClick={onAnalyze}
          disabled={!file || isLoading}
          whileHover={file && !isLoading ? { scale: 1.02 } : undefined}
          whileTap={file && !isLoading ? { scale: 0.98 } : undefined}
          className={cn(
            "w-full mt-6 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200",
            file && !isLoading
              ? "bg-ev-gold/15 border border-ev-gold/40 text-ev-gold hover:bg-ev-gold/25"
              : "bg-white/[0.03] border border-ev-border text-ev-text-muted cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Generate Intelligence Report
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
