"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, ChevronDown, GraduationCap } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface ProfileEvidenceProps {
  experienceSummary: string[];
  educationSummary: string[];
}

export default function ProfileEvidence({ experienceSummary, educationSummary }: ProfileEvidenceProps) {
  const [showAll, setShowAll] = useState(false);
  const hasExp = experienceSummary.length > 0;
  const hasEdu = educationSummary.length > 0;
  const visible = showAll ? experienceSummary : experienceSummary.slice(0, 3);

  if (!hasExp && !hasEdu) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
      <div className="space-y-4">
        {hasExp && (
          <GlassCard padding="lg" className="dashboard-surface rounded-[28px]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                <Briefcase className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <p className="section-label mb-1">Experience</p>
                <h4 className="text-lg font-medium text-ev-text">Professional evidence</h4>
              </div>
            </div>

            <div className="space-y-3">
              {visible.map((exp, i) => (
                <div key={i} className="dashboard-surface-soft rounded-2xl p-4">
                  <p className="text-sm leading-relaxed text-ev-text-secondary">{exp}</p>
                </div>
              ))}
            </div>

            {experienceSummary.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 flex items-center gap-1 text-xs text-ev-gold transition-colors hover:text-ev-gold-soft"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showAll ? "rotate-180" : ""}`} />
                {showAll ? "Show less" : `+${experienceSummary.length - 3} more`}
              </button>
            )}
          </GlassCard>
        )}
        {hasEdu && (
          <GlassCard padding="lg" className="dashboard-surface rounded-[28px]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10">
                <GraduationCap className="h-4 w-4 text-cyan-300" />
              </div>
              <div>
                <p className="section-label mb-1">Education</p>
                <h4 className="text-lg font-medium text-ev-text">Academic context</h4>
              </div>
            </div>

            <div className="space-y-3">
              {educationSummary.map((edu, i) => (
                <div key={i} className="dashboard-surface-soft rounded-2xl p-4">
                  <p className="text-sm leading-relaxed text-ev-text-secondary">{edu}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
