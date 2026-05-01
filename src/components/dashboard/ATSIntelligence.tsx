"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import ProgressRing from "@/components/ui/ProgressRing";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface ATSIntelligenceProps {
  score: number;
  feedback: string;
  issues?: string[];
}

export default function ATSIntelligence({ score, feedback, issues = [] }: ATSIntelligenceProps) {
  const verdict =
    score >= 85
      ? "Excellent"
      : score >= 70
        ? "Good"
        : score >= 50
          ? "Fair"
          : "Needs Work";

  const verdictColor =
    score >= 85
      ? "text-emerald-400"
      : score >= 70
        ? "text-ev-gold"
        : score >= 50
          ? "text-amber-400"
          : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <GlassCard padding="lg" className="dashboard-surface rounded-[28px]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-ev-gold/25 bg-ev-gold/10">
            <Shield className="h-4 w-4 text-ev-gold" />
          </div>
          <div>
            <p className="section-label mb-1">ATS Compatibility</p>
            <h3 className="text-lg font-medium text-ev-text">Screening readiness</h3>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <ProgressRing value={score} size={136} strokeWidth={12} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-ev-text">
                <AnimatedCounter value={score} />
              </span>
              <span className="text-[11px] font-mono text-ev-text-muted">/ 100</span>
            </div>
          </div>

          <div>
            <p className={`text-lg font-display font-bold ${verdictColor}`}>{verdict}</p>
            <p className="mt-2 text-sm leading-relaxed text-ev-text-secondary">{feedback}</p>
          </div>

          {issues.length > 0 && (
            <div className="dashboard-surface-soft w-full space-y-2 rounded-2xl p-4 text-left">
              <p className="section-label">Focus Next</p>
              {issues.slice(0, 2).map((issue) => (
                <div key={issue} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 text-amber-300" />
                  <p className="text-xs leading-relaxed text-ev-text-secondary">{issue}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
