"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { ChevronDown, Sparkles, TrendingUp } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import type { CareerPath } from "@/types/analysis";

interface CareerAnalyticsProps {
  careerPaths: CareerPath[];
}

export default function CareerAnalytics({ careerPaths }: CareerAnalyticsProps) {
  const validPaths = useMemo(() => careerPaths.filter(p => p && p.role && p.matchPercentage), [careerPaths]);
  const sorted = useMemo(() => [...validPaths].sort((a, b) => b.matchPercentage - a.matchPercentage), [validPaths]);
  const [selected, setSelected] = useState<CareerPath | null>(sorted[0] || null);

  useEffect(() => {
    setSelected(sorted[0] || null);
  }, [sorted]);

  if (validPaths.length === 0) return null;

  const barData = sorted.map(p => ({ name: p.role, value: p.matchPercentage }));
  const radarData = selected?.skillProficiencyAnalysis?.map(s => ({
    subject: s.skill, user: s.userProficiency, required: s.requiredProficiency,
  })) || [];
  const barPalette = ["#22d3ee", "#34d399", "#2dd4bf", "#4ade80", "#5eead4", "#a78bfa", "#38bdf8"];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div className="p-3 rounded-lg bg-ev-card/95 border border-ev-border backdrop-blur-sm">
          <p className="text-xs font-medium text-ev-text">{label}</p>
          <p className="text-xs text-ev-gold">{`Match: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
      <SectionHeader label="Career Path Deep Dive" title="Role match breakdown" subtitle="Compare the strongest role matches and inspect the selected path in detail." />

      <GlassCard padding="lg" className="dashboard-surface rounded-[30px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-label mb-2">Career Analytics</p>
            <h3 className="text-2xl font-display font-bold text-ev-text">Career path compatibility</h3>
          </div>

          <div className="relative w-full lg:max-w-md">
            <select
              value={selected?.role || ""}
              onChange={(e) => {
                const p = validPaths.find((item) => item.role === e.target.value);
                if (p) setSelected(p);
              }}
              className="dashboard-pill w-full appearance-none rounded-full py-3 pl-4 pr-10 text-sm text-ev-text outline-none transition-colors focus:border-ev-gold/40"
            >
              {sorted.map((p) => (
                <option key={p.role} value={p.role}>
                  {p.role} — {p.matchPercentage}%
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ev-text-muted" />
          </div>
        </div>

        <div className="mb-8 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 8, left: 0, bottom: 62 }}>
              <XAxis dataKey="name" stroke="#6F6F68" angle={-35} textAnchor="end" height={84} tick={{ fontSize: 11, fill: "#A8A8A0" }} interval={0} />
              <YAxis stroke="#6F6F68" domain={[0, 100]} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6F6F68" }} width={45} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={22} animationDuration={800}>
                {barData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === selected?.role ? "#a78bfa" : barPalette[index % barPalette.length]}
                    fillOpacity={entry.name === selected?.role ? 1 : 0.92}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <motion.div
                animate={{ opacity: [0.96, 1, 0.96] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="dashboard-surface-soft rounded-[24px] p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-ev-gold" />
                  <p className="text-sm font-medium text-ev-text">
                    Deep Dive: <span className="text-ev-gold-soft">{selected.role}</span>
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-ev-text-secondary">{selected.description}</p>
              </motion.div>

              <div className="grid gap-4 lg:grid-cols-2">
                <GlassCard padding="md" className="dashboard-surface-soft rounded-[24px]">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-300" />
                    <p className="text-sm font-medium text-ev-text">Relevant Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.relevantSkills?.map((s, i) => {
                      const name = typeof s === "string" ? s : s.name;
                      return (
                        <span key={i} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </GlassCard>

                <GlassCard padding="md" className="dashboard-surface-soft rounded-[24px]">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <p className="text-sm font-medium text-ev-text">Skills to Develop</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.skillsToDevelop?.map((s, i) => {
                      const name = typeof s === "string" ? s : s.name;
                      return (
                        <span key={i} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>

              {radarData.length > 0 && (
                <GlassCard padding="lg" className="dashboard-surface-soft rounded-[24px]">
                  <div className="mb-4">
                    <p className="section-label mb-2">Skill Proficiency Gap</p>
                    <h4 className="text-lg font-medium text-ev-text">Your strengths vs. role requirements</h4>
                  </div>

                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#A8A8A0", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Your Level" dataKey="user" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.22} strokeWidth={2} />
                        <Radar name="Required" dataKey="required" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.08} strokeWidth={2} strokeDasharray="4 4" />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-3 rounded bg-violet-400" />
                      <span className="text-xs text-ev-text-muted">Your Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-3 rounded bg-cyan-400" style={{ borderTop: "2px dashed" }} />
                      <span className="text-xs text-ev-text-muted">Required</span>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}
