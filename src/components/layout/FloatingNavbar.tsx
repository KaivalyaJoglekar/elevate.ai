"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useResumeContext } from "@/hooks/useResumeContext";
import { cn } from "@/lib/utils";

interface FloatingNavbarProps {
  showNewAnalysis?: boolean;
  onNewAnalysis?: () => void;
}

export default function FloatingNavbar({
  showNewAnalysis = false,
  onNewAnalysis,
}: FloatingNavbarProps) {
  const pathname = usePathname();
  const { taskId } = useResumeContext();
  const logoHref =
    pathname === "/dashboard" && taskId
      ? `/dashboard/${taskId}`
      : pathname.startsWith("/dashboard/")
        ? pathname
        : "/";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-[1360px] mx-auto px-6 py-4">
        <div
          className={cn(
            "flex items-center justify-between px-6 py-3",
            "bg-ev-card/60 backdrop-blur-xl border border-ev-border rounded-2xl"
          )}
        >
          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-ev-gold/10 border border-ev-gold/20 flex items-center justify-center group-hover:bg-ev-gold/20 transition-colors">
              <Sparkles className="w-4 h-4 text-ev-gold" />
            </div>
            <span className="font-display text-lg font-bold text-ev-text tracking-tight">
              Elevate<span className="text-ev-gold">.ai</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {showNewAnalysis && onNewAnalysis && (
              <button
                onClick={onNewAnalysis}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  "border border-ev-gold/30 text-ev-gold hover:bg-ev-gold/10",
                  "hover:border-ev-gold/50"
                )}
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
