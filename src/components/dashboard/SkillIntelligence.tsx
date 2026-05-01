"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { groupSkillsByCategory } from "@/lib/utils";
import type { Skill } from "@/types/analysis";

interface SkillIntelligenceProps {
  skills: Skill[];
}

const PILL_STYLES = [
  "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300",
  "border-amber-500/20 bg-amber-500/10 text-amber-300",
  "border-violet-500/20 bg-violet-500/10 text-violet-300",
  "border-blue-500/20 bg-blue-500/10 text-blue-300",
];

export default function SkillIntelligence({ skills }: SkillIntelligenceProps) {
  const grouped = useMemo(() => groupSkillsByCategory(skills), [skills]);
  const categories = useMemo(
    () => Object.entries(grouped).sort((a, b) => b[1].length - a[1].length),
    [grouped]
  );
  const topCategories = categories.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <SectionHeader
        label="Key Skills"
        title="Extracted skill signal"
        subtitle={`${skills.length} skills identified across ${categories.length} domains`}
      />

      <GlassCard
        padding="lg"
        className="dashboard-surface rounded-[28px]"
      >
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
      </GlassCard>
    </motion.div>
  );
}
