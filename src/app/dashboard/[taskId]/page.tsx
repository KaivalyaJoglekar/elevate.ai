"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FloatingNavbar from "@/components/layout/FloatingNavbar";
import DashboardTopBar from "@/components/layout/DashboardTopBar";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";
import RetargetAnalysisPanel from "@/components/dashboard/RetargetAnalysisPanel";
import ScoreOverviewGrid from "@/components/dashboard/ScoreOverviewGrid";
import ATSIntelligence from "@/components/dashboard/ATSIntelligence";
import SkillIntelligence from "@/components/dashboard/SkillIntelligence";
import ResumeImprovementBoard from "@/components/dashboard/ResumeImprovementBoard";
import ProfileEvidence from "@/components/dashboard/ProfileEvidence";
import CareerAnalytics from "@/components/dashboard/CareerAnalytics";
import RecommendedOpportunities from "@/components/dashboard/RecommendedOpportunities";
import ErrorState from "@/components/ui/ErrorState";
import GlassCard from "@/components/ui/GlassCard";
import ProcessingOverlay from "@/components/upload/ProcessingOverlay";
import { useResumeContext } from "@/hooks/useResumeContext";
import { fetchAnalysisStatus, retargetExistingAnalysis } from "@/lib/api";
import type { AnalysisTrackKey } from "@/types/analysis";

export default function DashboardTaskPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const {
    analysisStatus,
    setAnalysisStatus,
    setTaskId,
    error,
    setError,
    isLoading,
    setIsLoading,
    setFile,
    setFileName,
  } = useResumeContext();
  const [selectedTrack, setSelectedTrack] = useState<AnalysisTrackKey>("full_time_analysis");
  const [isRetargeting, setIsRetargeting] = useState(false);
  const taskId = typeof params.taskId === "string" ? params.taskId : "";

  useEffect(() => {
    if (!taskId) {
      router.replace("/");
      return;
    }

    setTaskId(taskId);
  }, [router, setTaskId, taskId]);

  useEffect(() => {
    if (!taskId) {
      return;
    }

    if (isRetargeting) {
      return;
    }

    if (analysisStatus?.task_id === taskId) {
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      try {
        const payload = await fetchAnalysisStatus(taskId, controller.signal);
        setAnalysisStatus(payload);
        setError(payload.error);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load analysis.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => controller.abort();
  }, [analysisStatus?.task_id, isRetargeting, setAnalysisStatus, setError, setIsLoading, taskId]);

  useEffect(() => {
    if (!taskId || !analysisStatus || analysisStatus.task_id !== taskId) {
      return;
    }

    if (isRetargeting) {
      return;
    }

    const shouldContinuePolling =
      ["queued", "processing"].includes(analysisStatus.status) ||
      (analysisStatus.status === "completed" && Boolean(analysisStatus.result?.job_market_pending));

    if (!shouldContinuePolling) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const payload = await fetchAnalysisStatus(taskId);
        setAnalysisStatus(payload);
        setError(payload.error);
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : "Failed to refresh analysis.");
      }
    }, analysisStatus.status === "completed" ? 2500 : 1500);

    return () => window.clearInterval(intervalId);
  }, [analysisStatus, isRetargeting, setAnalysisStatus, setError, taskId]);

  useEffect(() => {
    const result = analysisStatus?.result;
    if (!result) {
      return;
    }

    const defaultTrack = result.experience_level.toLowerCase().includes("intern")
      ? "internship_analysis"
      : "full_time_analysis";
    setSelectedTrack(defaultTrack);
  }, [analysisStatus?.result]);

  const activeResult = analysisStatus?.result;
  const activeAnalysis = useMemo(() => {
    if (!activeResult) {
      return null;
    }

    return activeResult[selectedTrack];
  }, [activeResult, selectedTrack]);

  const hasValidPaths = (activeAnalysis?.careerPaths || []).some(
    (path) => path && path.role && path.matchPercentage
  );
  const isMarketPending = Boolean(activeResult?.job_market_pending);
  const activeMarketQuery = selectedTrack === "full_time_analysis"
    ? activeResult?.full_time_query
    : activeResult?.internship_query;

  const handleNewAnalysis = () => {
    setTaskId(null);
    setAnalysisStatus(null);
    setError(null);
    setFile(null);
    setFileName(null);
    router.push("/");
  };

  const handleRetarget = async (payload: {
    targetRole: string;
    experienceLevel: string;
    jobDescription: string;
  }) => {
    if (!taskId) {
      return;
    }

    setIsRetargeting(true);
    setError(null);

    try {
      const nextPayload = await retargetExistingAnalysis(taskId, {
        target_role: payload.targetRole,
        experience_level: payload.experienceLevel,
        job_description: payload.jobDescription,
      });
      setTaskId(nextPayload.task_id);
      setAnalysisStatus(nextPayload);
      setError(nextPayload.error);
      router.push(`/dashboard/${nextPayload.task_id}`);
    } catch (retargetError) {
      setError(retargetError instanceof Error ? retargetError.message : "Failed to re-target analysis.");
    } finally {
      setIsRetargeting(false);
    }
  };

  if (!taskId) {
    return null;
  }

  const showOverlay =
    isRetargeting ||
    isLoading ||
    (analysisStatus?.task_id === taskId &&
      ["queued", "processing"].includes(analysisStatus.status));

  return (
    <>
      <ProcessingOverlay
        isVisible={showOverlay}
        currentStepLabel={isRetargeting ? "Re-targeting for your new role" : analysisStatus?.current_step}
        progress={isRetargeting ? undefined : analysisStatus?.progress}
      />
      <FloatingNavbar showNewAnalysis onNewAnalysis={handleNewAnalysis} />

      <main className="relative mx-auto max-w-[1180px] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <motion.div
          animate={{ x: [0, 12, 0], y: [0, -18, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-8 top-28 h-40 w-40 rounded-full bg-cyan-500/[0.05] blur-[90px]"
        />
        <motion.div
          animate={{ x: [0, -8, 0], y: [0, 14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-0 top-[40rem] h-52 w-52 rounded-full bg-violet-500/[0.05] blur-[120px]"
        />
        {!activeAnalysis ? (
          <div className="pt-16">
            <ErrorState
              title={analysisStatus?.status === "failed" ? "Analysis failed" : "Analysis unavailable"}
              message={analysisStatus?.error || error || "The analysis report could not be loaded."}
              onRetry={handleNewAnalysis}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <DashboardTopBar
              candidateName={activeResult?.candidate_name || activeAnalysis.name}
              onNewAnalysis={handleNewAnalysis}
            />

            <section className="space-y-5">
              <ExecutiveSummary
                name={activeResult?.candidate_name || activeAnalysis.name}
                summary={activeAnalysis.summary || "Career profile analysis complete."}
                targetRole={activeResult?.target_role}
                experienceLevel={activeResult?.experience_level}
                marketRegion={activeResult?.market_context?.region_name}
                marketStatus={activeResult?.job_market_status}
                marketPending={activeResult?.job_market_pending}
                marketLive={activeResult?.job_market_live}
                fullTimeJobCount={activeResult?.full_time_job_count}
                internshipJobCount={activeResult?.internship_job_count}
              />

              <div className="flex justify-center">
                <div className="dashboard-pill rounded-full p-1.5">
                  <div className="relative grid grid-cols-2 gap-1.5">
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 280, damping: 28 }}
                      className={`absolute inset-y-0 top-0 w-[calc(50%-3px)] rounded-full ${
                        selectedTrack === "full_time_analysis"
                          ? "left-0 bg-emerald-500/15 border border-emerald-500/35"
                          : "left-[calc(50%+3px)] bg-violet-500/15 border border-violet-500/35"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedTrack("full_time_analysis")}
                      className={`relative z-10 rounded-full px-5 py-2.5 text-sm transition-colors ${
                        selectedTrack === "full_time_analysis"
                          ? "text-emerald-300"
                          : "border border-transparent text-ev-text-secondary"
                      }`}
                    >
                      Full-Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTrack("internship_analysis")}
                      className={`relative z-10 rounded-full px-5 py-2.5 text-sm transition-colors ${
                        selectedTrack === "internship_analysis"
                          ? "text-violet-300"
                          : "border border-transparent text-ev-text-secondary"
                      }`}
                    >
                      Internship
                    </button>
                  </div>
                </div>
              </div>

              <RetargetAnalysisPanel
                initialTargetRole={activeResult?.target_role}
                initialExperienceLevel={activeResult?.experience_level}
                initialJobDescription={activeResult?.job_description_raw}
                isLoading={isRetargeting}
                onSubmit={handleRetarget}
              />
            </section>

            <ScoreOverviewGrid data={activeAnalysis} />

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_320px]">
              <div className="space-y-6">
                {activeAnalysis.extractedSkills?.length > 0 && (
                  <SkillIntelligence skills={activeAnalysis.extractedSkills} />
                )}

                {(activeAnalysis.generalResumeImprovements?.length > 0 ||
                  activeAnalysis.generalUpskillingSuggestions?.length > 0) && (
                    <ResumeImprovementBoard
                      improvements={activeAnalysis.generalResumeImprovements || []}
                      suggestions={activeAnalysis.generalUpskillingSuggestions || []}
                    />
                  )}
              </div>

              <div className="space-y-6">
                {activeAnalysis.atsScore && (
                  <ATSIntelligence
                    score={activeAnalysis.atsScore.score}
                    feedback={activeAnalysis.atsScore.feedback}
                    issues={activeAnalysis.atsScore.topIssues}
                  />
                )}

                <ProfileEvidence
                  experienceSummary={activeAnalysis.experienceSummary || []}
                  educationSummary={activeAnalysis.educationSummary || []}
                />
              </div>
            </section>

            {hasValidPaths && (
              <CareerAnalytics careerPaths={activeAnalysis.careerPaths} />
            )}

            {!hasValidPaths && (
              <GlassCard
                padding="md"
                className="dashboard-surface rounded-[24px]"
              >
                <p className="text-sm text-ev-text-secondary">
                  {isMarketPending
                    ? activeResult?.job_market_status || "Loading live market opportunities in the background."
                    : activeResult?.job_market_status || "No live role matches are available for this track yet. You can still search manually below."}
                </p>
              </GlassCard>
            )}

            <RecommendedOpportunities
              careerPaths={activeAnalysis.careerPaths}
              marketQuery={activeMarketQuery}
              jobType={selectedTrack === "full_time_analysis" ? "full-time" : "internship"}
              marketRegion={activeResult?.market_context?.region_name}
              targetRole={activeResult?.target_role}
            />
          </motion.div>
        )}

        <p className="mt-16 text-center text-xs text-ev-text-muted">
          crafted for career path mapping
        </p>
      </main>
    </>
  );
}
