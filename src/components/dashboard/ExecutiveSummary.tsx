"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Gauge, Loader2, User } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import ExpandableText from "@/components/ui/ExpandableText";

interface ExecutiveSummaryProps {
  name: string;
  summary: string;
  targetRole?: string;
  experienceLevel?: string;
  marketRegion?: string;
  marketStatus?: string;
  marketPending?: boolean;
  marketLive?: boolean;
  fullTimeJobCount?: number;
  internshipJobCount?: number;
}

export default function ExecutiveSummary({
  name,
  summary,
  targetRole,
  experienceLevel,
  marketRegion,
  marketStatus,
  marketPending = false,
  marketLive = true,
  fullTimeJobCount = 0,
  internshipJobCount = 0,
}: ExecutiveSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <GlassCard
        padding="lg"
        className="dashboard-surface relative overflow-hidden border-[rgba(0,212,255,0.22)] bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.14),transparent_28%),linear-gradient(180deg,rgba(10,11,18,0.98),rgba(6,7,11,0.96))] shadow-[0_0_0_1px_rgba(126,232,250,0.06),0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-10 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full border border-ev-border bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent_65%)]"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ev-gold/50 to-transparent" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-ev-gold/20 bg-ev-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-ev-gold-soft">
              <Gauge className="h-3 w-3" />
              Career Intelligence Summary
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_320px] lg:items-start">
            <div className="min-w-0">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ev-gold/20 bg-ev-gold/10">
                  <User className="h-5 w-5 text-ev-gold" />
                </div>
                <div className="min-w-0">
                  <p className="section-label mb-2">Candidate</p>
                  <h1 className="truncate font-display text-3xl font-bold tracking-tight text-ev-text sm:text-4xl">
                    {name}
                  </h1>
                </div>
              </div>

              <ExpandableText
                text={summary}
                maxLines={4}
              />

              <div className="mt-5 flex flex-wrap gap-2">
                {targetRole && (
                  <span className="dashboard-tag rounded-full px-3 py-1.5 text-xs text-ev-text-secondary">
                    Target: {targetRole}
                  </span>
                )}
                {experienceLevel && (
                  <span className="dashboard-tag rounded-full px-3 py-1.5 text-xs text-ev-text-secondary">
                    {experienceLevel}
                  </span>
                )}
                {marketRegion && (
                  <span className="dashboard-tag rounded-full px-3 py-1.5 text-xs text-ev-text-secondary">
                    {marketRegion} market
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <div
                className={`rounded-2xl border px-4 py-4 ${
                  marketPending
                    ? "bg-cyan-500/10 border-cyan-500/20"
                    : marketLive
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  {marketPending ? (
                    <Loader2 className="w-3.5 h-3.5 mt-0.5 animate-spin text-cyan-300" />
                  ) : marketLive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-amber-400" />
                  )}
                  <div className="space-y-1">
                    <p
                      className={`text-xs font-medium uppercase tracking-[0.14em] ${
                        marketPending
                          ? "text-cyan-300"
                          : marketLive
                            ? "text-emerald-300"
                            : "text-amber-300"
                      }`}
                    >
                      {marketPending
                        ? "Market feed loading"
                        : marketLive
                          ? "Market feed connected"
                          : "Market feed incomplete"}
                    </p>
                    <p className="text-[11px] text-ev-text-secondary leading-relaxed">
                      {marketStatus || "Live job market feed updated successfully."}
                    </p>
                    <p className="text-[11px] text-ev-text-muted">
                      {marketRegion ? `Region: ${marketRegion} · ` : ""}
                      Full-time jobs: {fullTimeJobCount} · Internship jobs: {internshipJobCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="dashboard-surface-soft rounded-2xl px-4 py-4">
                  <p className="section-label mb-2">Track Jobs</p>
                  <p className="font-display text-2xl font-bold text-ev-text">
                    {fullTimeJobCount + internshipJobCount}
                  </p>
                  <p className="mt-1 text-xs text-ev-text-muted">live roles in current report</p>
                </div>
                <div className="dashboard-surface-soft rounded-2xl px-4 py-4">
                  <p className="section-label mb-2">Feed Health</p>
                  <p
                    className={`font-display text-2xl font-bold ${
                      marketPending ? "text-cyan-300" : marketLive ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {marketPending ? "SYNC" : marketLive ? "OK" : "WARN"}
                  </p>
                  <p className="mt-1 text-xs text-ev-text-muted">job-market enrichment state</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
