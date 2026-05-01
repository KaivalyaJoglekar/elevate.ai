"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress
    const duration = 1800;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setIsVisible(false), 300);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black"
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-2xl bg-ev-gold/10 border border-ev-gold/20 flex items-center justify-center mb-6"
            >
              <Sparkles className="w-7 h-7 text-ev-gold" />
            </motion.div>

            {/* Brand */}
            <h1 className="font-display text-3xl font-bold tracking-tight text-ev-text mb-1">
              Elevate<span className="text-ev-gold">.ai</span>
            </h1>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-ev-text-muted mb-8">
              Career Intelligence Studio
            </p>

            {/* Progress bar */}
            <div className="w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ev-gold/60 to-ev-gold rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>

            {/* Progress text */}
            <p className="mt-3 text-xs font-mono text-ev-text-muted tabular-nums">
              {progress}%
            </p>
          </motion.div>

          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-ev-gold/[0.03] blur-[100px] pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
