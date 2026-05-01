"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResumeContext } from "@/hooks/useResumeContext";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import FloatingNavbar from "@/components/layout/FloatingNavbar";
import UploadHero from "@/components/upload/UploadHero";
import ResumeUploadConsole from "@/components/upload/ResumeUploadConsole";
import ProcessingOverlay from "@/components/upload/ProcessingOverlay";
import BlackCanvasBackground from "@/components/background/BlackCanvasBackground";

export default function UploadPage() {
  const router = useRouter();
  const {
    isHydrated,
    taskId,
    analysisStatus,
    setTaskId,
    setAnalysisStatus,
    setFileName,
    setFile: setContextFile,
    setIsLoading: setCtxLoading,
    setError: setContextError,
    isLoading: ctxLoading,
  } = useResumeContext();
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [jobDescription, setJobDescription] = useState("");
  const {
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
  } = useResumeUpload();

  const loading = isLoading || ctxLoading;
  const resumeDashboardHref = taskId ? `/dashboard/${taskId}` : null;

  const onAnalyze = async () => {
    if (!file) return;
    setCtxLoading(true);
    setContextError(null);
    setFileName(file.name);
    setContextFile(file);

    try {
      const result = await handleAnalyze({
        targetRole,
        experienceLevel,
        jobDescription,
      });
      if (!result) {
        return;
      }

      setTaskId(result.task_id);
      setAnalysisStatus(result);
      setContextError(result.error);
      router.push(`/dashboard/${result.task_id}`);
    } finally {
      setCtxLoading(false);
    }
  };

  return (
    <>
      <BlackCanvasBackground />
      <ProcessingOverlay isVisible={loading} />
      <FloatingNavbar />

      <main className="min-h-screen px-4 sm:px-6 pt-24 pb-16">
        <section className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,480px)] lg:items-start xl:gap-20">
          <div className="flex min-w-0 justify-center lg:justify-start lg:pt-10">
            <UploadHero />
          </div>

          <div className="w-full max-w-xl justify-self-center lg:justify-self-end">
            {isHydrated && resumeDashboardHref && (
              <div className="mb-6">
                <Link
                  href={resumeDashboardHref}
                  className="dashboard-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ev-text-secondary transition-colors hover:border-ev-gold/35 hover:bg-ev-gold/10 hover:text-ev-text"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Resume last analysis
                  {analysisStatus?.cached ? <span className="text-emerald-300">cached</span> : null}
                </Link>
              </div>
            )}

            <ResumeUploadConsole
              file={file}
              isDragging={isDragging}
              isLoading={loading}
              error={error}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFileSelect={handleFileSelect}
              onRemoveFile={handleRemoveFile}
              onAnalyze={onAnalyze}
            />

            <section className="mt-6 w-full glass-card p-5 sm:p-6">
              <div className="grid gap-4">
                <div>
                  <label className="section-label block mb-2">Target Role</label>
                  <input
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="e.g. Backend Engineer, Data Analyst, Product Designer"
                    className="w-full rounded-xl border border-ev-border bg-white/[0.03] px-4 py-3 text-sm text-ev-text outline-none transition-colors focus:border-ev-gold/40"
                  />
                </div>

                <div>
                  <label className="section-label block mb-2">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(event) => setExperienceLevel(event.target.value)}
                    className="w-full rounded-xl border border-ev-border bg-white/[0.03] px-4 py-3 text-sm text-ev-text outline-none transition-colors focus:border-ev-gold/40"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="section-label block mb-2">Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    rows={5}
                    placeholder="Paste a target job description to tailor the analysis."
                    className="w-full rounded-xl border border-ev-border bg-white/[0.03] px-4 py-3 text-sm text-ev-text outline-none transition-colors focus:border-ev-gold/40"
                  />
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* Footer */}
        <p className="mt-16 text-xs text-ev-text-muted">
          made with ❤️ by Kaivalya
        </p>
      </main>
    </>
  );
}
