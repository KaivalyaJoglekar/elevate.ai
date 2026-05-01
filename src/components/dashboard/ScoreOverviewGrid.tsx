"use client";

import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { CareerData } from "@/types/analysis";

interface ScoreOverviewGridProps {
  data: CareerData;
}

export default function ScoreOverviewGrid({ data }: ScoreOverviewGridProps) {
  const atsScore = data.atsScore?.score ?? 0;

  // Compute skill count
  const totalSkills = data.extractedSkills?.length ?? 0;

  // Compute avg career match from top 3 paths
  const validPaths = (data.careerPaths || []).filter(
    (p) => p && p.matchPercentage
  );
  const sortedPaths = [...validPaths].sort(
    (a, b) => b.matchPercentage - a.matchPercentage
  );
  const topPaths = sortedPaths.slice(0, 3);
  const avgMatch =
    topPaths.length > 0
      ? Math.round(
        topPaths.reduce((sum, p) => sum + p.matchPercentage, 0) /
        topPaths.length
      )
      : 0;

  // Compute missing skills count
  const allMissingSkills = new Set<string>();
  validPaths.forEach((p) => {
    p.skillsToDevelop?.forEach((s) => {
      const name = typeof s === "string" ? s : s.name;
      if (name) allMissingSkills.add(name.toLowerCase());
    });
  });

  const scores = [
    {
      label: "ATS Score",
      value: atsScore,
      suffix: "",
      icon: Shield,
      context: data.atsScore?.feedback || "ATS compatibility rating",
      variant: atsScore >= 85 ? "success" : atsScore >= 70 ? "gold" : atsScore >= 50 ? "warning" : "danger",
    },
    {
      label: "Career Fit",
      value: avgMatch,
      suffix: "%",
      icon: TrendingUp,
      context: `Avg match across top ${topPaths.length} roles`,
      variant: avgMatch >= 80 ? "success" : avgMatch >= 60 ? "gold" : "warning",
    },
    {
      label: "Skills Found",
      value: totalSkills,
      suffix: "",
      icon: Zap,
      context: "Technical & soft skills identified",
      variant: totalSkills >= 15 ? "success" : totalSkills >= 8 ? "gold" : "warning",
    },
    {
      label: "Skill Gaps",
      value: allMissingSkills.size,
      suffix: "",
      icon: AlertTriangle,
      context: "Unique skills to develop",
      variant: allMissingSkills.size <= 3 ? "success" : allMissingSkills.size <= 6 ? "warning" : "danger",
    },
  ] as const;

  const variantColors = {
    success: "text-emerald-400",
    gold: "text-cyan-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  const variantBg = {
    success: "bg-emerald-500/10 border-emerald-500/20",
    gold: "bg-cyan-500/10 border-cyan-500/20",
    warning: "bg-amber-500/10 border-amber-500/20",
    danger: "bg-red-500/10 border-red-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {scores.map((score, index) => (
          <motion.div
            key={score.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + index * 0.08 }}
            whileHover={{ y: -6 }}
          >
            <GlassCard hover className="dashboard-surface-soft h-full rounded-[22px] px-4 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${variantBg[score.variant]}`}
                >
                  <score.icon className={`h-4 w-4 ${variantColors[score.variant]}`} />
                </div>
                <p className="section-label truncate">{score.label}</p>
              </div>

              <div className={`mb-1 text-3xl font-display font-bold ${variantColors[score.variant]}`}>
                <AnimatedCounter value={score.value} suffix={score.suffix} />
              </div>

              <p
                className="text-xs leading-relaxed text-ev-text-muted"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {score.context}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
