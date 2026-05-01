"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Sparkles, Wrench } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";

interface ResumeImprovementBoardProps {
  improvements: string[];
  suggestions: string[];
}

export default function ResumeImprovementBoard({
  improvements,
  suggestions,
}: ResumeImprovementBoardProps) {
  const [showAllImprovements, setShowAllImprovements] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const visibleImprovements = showAllImprovements
    ? improvements
    : improvements.slice(0, 3);
  const visibleSuggestions = showAllSuggestions
    ? suggestions
    : suggestions.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <SectionHeader
        label="Action Board"
        title="Resume Improvements"
        subtitle="Prioritized changes to strengthen your resume"
      />

      <div className="space-y-4">
        {/* Resume Improvements */}
        <GlassCard padding="lg" className="dashboard-surface rounded-[28px]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
              <Wrench className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <p className="section-label mb-1">Resume Improvements</p>
              <h4 className="text-lg font-medium text-ev-text">High-impact changes</h4>
            </div>
          </div>

          <div className="space-y-3.5">
            {visibleImprovements.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="dashboard-surface-soft flex items-start gap-3 rounded-2xl p-4"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-300">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-ev-text-secondary">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
          {improvements.length > 3 && (
            <button
              onClick={() => setShowAllImprovements(!showAllImprovements)}
              className="mt-4 flex items-center gap-1 text-xs text-ev-gold transition-colors hover:text-ev-gold-soft"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showAllImprovements ? "rotate-180" : ""}`} />
              {showAllImprovements ? "Show less" : `+${improvements.length - 3} more`}
            </button>
          )}
        </GlassCard>

        {/* Upskilling Suggestions */}
        <GlassCard padding="lg" className="dashboard-surface rounded-[28px]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10">
              <Sparkles className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <p className="section-label mb-1">Upskilling Suggestions</p>
              <h4 className="text-lg font-medium text-ev-text">What to learn next</h4>
            </div>
          </div>

          <div className="space-y-3.5">
            {visibleSuggestions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="dashboard-surface-soft flex items-start gap-3 rounded-2xl p-4"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <p className="text-sm leading-relaxed text-ev-text-secondary">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
          {suggestions.length > 3 && (
            <button
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              className="mt-4 flex items-center gap-1 text-xs text-ev-gold transition-colors hover:text-ev-gold-soft"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showAllSuggestions ? "rotate-180" : ""}`} />
              {showAllSuggestions ? "Show less" : `+${suggestions.length - 3} more`}
            </button>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}
