"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export default function ExpandableText({
  text,
  maxLines = 3,
  className,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <p
        className={cn(
          "text-sm text-ev-text-secondary leading-relaxed transition-all duration-300",
          !expanded && `line-clamp-${maxLines}`
        )}
        style={!expanded ? { WebkitLineClamp: maxLines, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" } : undefined}
      >
        {text}
      </p>
      {text.length > 150 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 text-xs font-medium text-ev-gold hover:text-ev-gold-soft transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
