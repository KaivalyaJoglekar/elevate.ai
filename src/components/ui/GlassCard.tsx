"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export default function GlassCard({
  children,
  className,
  hover = false,
  padding = "md",
}: GlassCardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "glass-card",
        paddings[padding],
        hover && "hover:border-ev-border-strong hover:shadow-glow-gold transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}
