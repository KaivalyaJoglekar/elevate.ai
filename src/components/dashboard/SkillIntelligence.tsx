"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, Target } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { groupSkillsByCategory, normalizeLabel } from "@/lib/utils";
import type { CareerPath, Skill } from "@/types/analysis";

interface SkillIntelligenceProps {
  skills: Skill[];
  targetRole?: string;
  trackLabel: string;
  missingKeywords?: string[];
  careerPaths?: CareerPath[];
}

const PILL_STYLES = [
  "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300",
  "border-amber-500/20 bg-amber-500/10 text-amber-300",
  "border-violet-500/20 bg-violet-500/10 text-violet-300",
  "border-blue-500/20 bg-blue-500/10 text-blue-300",
];

export default function SkillIntelligence({
  skills,
  targetRole,
  trackLabel,
  missingKeywords = [],
  careerPaths = [],
}: SkillIntelligenceProps) {
  const grouped = useMemo(() => groupSkillsByCategory(skills), [skills]);
  const categories = useMemo(
    () => Object.entries(grouped).sort((a, b) => b[1].length - a[1].length),
    [grouped]
  );
  const topCategories = categories.slice(0, 4);
  const gapSkills = useMemo(() => {
    const deduped = new Map<string, string>();

    const register = (value?: string) => {
      const normalized = normalizeLabel(value || "");
      if (!normalized) {
        return;
      }
      const key = normalized.toLowerCase();
      if (!deduped.has(key)) {
        deduped.set(key, normalized);
      }
    };

    missingKeywords.forEach((keyword) => register(keyword));
    careerPaths.forEach((path) => {
      path.skillsToDevelop?.forEach((skill) => {
        register(typeof skill === "string" ? skill : skill.name);
      });
    });

    return Array.from(deduped.values());
  }, [careerPaths, missingKeywords]);
  const targetLabel = normalizeLabel(targetRole || "Target role");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <SectionHeader
        label="Skill Match"
        title={`Skills for ${targetLabel}`}
        subtitle={`${trackLabel} targeting: ${skills.length} current skills and ${gapSkills.length} gap signals`}
      />

      <GlassCard
        padding="lg"
        className="dashboard-surface rounded-[28px]"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="dashboard-surface-soft rounded-[24px] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <div>
                <p className="section-label mb-1">Your Resume Signals</p>
                <h4 className="text-lg font-medium text-ev-text">Skills already visible to recruiters</h4>
              </div>
            </div>

            {topCategories.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {topCategories.map(([category, categorySkills]) => (
                  <span
                    key={category}
                    className="dashboard-tag rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ev-text-muted"
                  >
                    {category} · {categorySkills.length}
                  </span>
                ))}
              </div>
            )}

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, index) => (
                  <span
                    key={skill.name}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      PILL_STYLES[index % PILL_STYLES.length]
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm leading-relaxed text-ev-text-secondary">
                  The parser did not extract enough explicit skills from the resume yet, so this panel is relying more on ATS keywords and role gaps.
                </p>
              </div>
            )}
          </div>

          <div className="dashboard-surface-soft rounded-[24px] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                <Target className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <p className="section-label mb-1">Target Role Gaps</p>
                <h4 className="text-lg font-medium text-ev-text">{targetLabel} · {trackLabel}</h4>
              </div>
            </div>

            {gapSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {gapSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm leading-relaxed text-emerald-200">
                  No major skill gaps were flagged for this selected track yet. Use the ATS issues and role cards below to fine-tune further.
                </p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
