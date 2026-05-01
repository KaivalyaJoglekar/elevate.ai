"use client";

import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTopBarProps {
  candidateName: string;
  onNewAnalysis: () => void;
}

export default function DashboardTopBar({
  candidateName,
  onNewAnalysis,
}: DashboardTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("flex items-center justify-between gap-4")}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">
            Analysis Complete
          </span>
        </div>
        <span className="hidden truncate text-sm text-ev-text-muted sm:block">
          {candidateName}
        </span>
      </div>

      <button
        onClick={onNewAnalysis}
        className={cn(
          "dashboard-pill flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm text-ev-text-secondary transition-all duration-200",
          "hover:border-ev-gold/35 hover:bg-ev-gold/10 hover:text-ev-text"
        )}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>New Analysis</span>
      </button>
    </motion.div>
  );
}
