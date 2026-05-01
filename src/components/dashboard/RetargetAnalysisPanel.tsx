"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRightLeft, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";

interface RetargetAnalysisPanelProps {
  initialTargetRole?: string;
  initialExperienceLevel?: string;
  initialJobDescription?: string;
  isLoading?: boolean;
  onSubmit: (payload: {
    targetRole: string;
    experienceLevel: string;
    jobDescription: string;
  }) => Promise<void>;
}

export default function RetargetAnalysisPanel({
  initialTargetRole = "Software Engineer",
  initialExperienceLevel = "Entry Level",
  initialJobDescription = "",
  isLoading = false,
  onSubmit,
}: RetargetAnalysisPanelProps) {
  const [targetRole, setTargetRole] = useState(initialTargetRole);
  const [experienceLevel, setExperienceLevel] = useState(initialExperienceLevel);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);

  useEffect(() => {
    setTargetRole(initialTargetRole);
    setExperienceLevel(initialExperienceLevel);
    setJobDescription(initialJobDescription);
  }, [initialExperienceLevel, initialJobDescription, initialTargetRole]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      targetRole: targetRole.trim() || "Software Engineer",
      experienceLevel: experienceLevel.trim() || "Entry Level",
      jobDescription: jobDescription.trim(),
    });
  };

  return (
    <GlassCard
      padding="lg"
      className="dashboard-surface rounded-[28px]"
    >
      <SectionHeader
        label="Re-Target"
        title="Analyze this resume for a different role"
        subtitle="Reuse the parsed resume and rerun the report for a new role, level, or job description."
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-4"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label className="section-label block mb-2">Target Role</label>
            <input
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="e.g. Backend Engineer, ML Engineer, Product Analyst"
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
        </div>

        <div>
          <label className="section-label block mb-2">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows={4}
            placeholder="Paste a target job description if you want the ATS and market analysis tailored more tightly."
            className="w-full rounded-xl border border-ev-border bg-white/[0.03] px-4 py-3 text-sm text-ev-text outline-none transition-colors focus:border-ev-gold/40"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ev-text-secondary">
            This creates a fresh report using the same resume content.
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className="dashboard-pill inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm text-ev-text transition-colors hover:border-ev-gold/30 hover:bg-ev-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Sparkles className="h-4 w-4 text-ev-gold animate-pulse" />
                Re-analyzing...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4 text-ev-gold" />
                Run new target
              </>
            )}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
