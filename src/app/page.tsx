"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResumeContext } from "@/hooks/useResumeContext";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { warmupBackend } from "@/lib/api";
import FloatingNavbar from "@/components/layout/FloatingNavbar";
import UploadHero from "@/components/upload/UploadHero";
import ResumeUploadConsole from "@/components/upload/ResumeUploadConsole";
import BlackCanvasBackground from "@/components/background/BlackCanvasBackground";

export default function UploadPage() {
  const router = useRouter();
  const {
    isHydrated,
    taskId,
    analysisStatus,
    setTaskId,
    setAnalysisStatus,
    setError: setContextError,
  } = useResumeContext();
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Full-Time");
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
    setError,
  } = useResumeUpload();

  const resumeDashboardHref = taskId ? `/dashboard/${taskId}` : null;

  useEffect(() => {
    const controller = new AbortController();
    void warmupBackend(controller.signal);
    return () => controller.abort();
  }, []);

  const onAnalyze = async () => {
    if (!file) return;
    if (!targetRole.trim()) {
      setError("Enter a target role before generating the report.");
      return;
    }
    setContextError(null);

    const result = await handleAnalyze({
      targetRole: targetRole.trim(),
      experienceLevel,
    });
    if (!result) {
      return;
    }

    setTaskId(result.task_id);
    setAnalysisStatus(result);
    setContextError(result.error);
    router.push(`/dashboard/${result.task_id}`);
  };

  return (
    <>
      <BlackCanvasBackground />
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
              isLoading={isLoading}
              canAnalyze={Boolean(file && targetRole.trim())}
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
                    className="w-full rounded-xl border border-ev-border bg-white/[0.03] px-4 py-3 text-sm text-ev-text outline-none transition-colors placeholder:text-ev-text-muted focus:border-ev-gold/40"
                  />
                </div>

                <div>
                  <label className="section-label block mb-2">Track</label>
                  <select
                    value={experienceLevel}
                    onChange={(event) => setExperienceLevel(event.target.value)}
                    className="w-full rounded-xl border border-ev-border bg-white/[0.03] px-4 py-3 text-sm text-ev-text outline-none transition-colors focus:border-ev-gold/40"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
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
