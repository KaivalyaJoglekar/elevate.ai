"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { PROCESSING_STEPS } from "@/lib/constants";
import { Check, Loader2 } from "lucide-react";

interface ProcessingOverlayProps {
  isVisible: boolean;
  currentStepLabel?: string;
  progress?: number;
}

export default function ProcessingOverlay({
  isVisible,
  currentStepLabel,
  progress,
}: ProcessingOverlayProps) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const controlledProgress = typeof progress === "number";

  useEffect(() => {
    if (!isVisible) {
      setSimulatedProgress(0);
      return;
    }

    if (controlledProgress) {
      return;
    }

    setSimulatedProgress((previous) => (previous > 0 ? previous : 10));

    const intervalId = window.setInterval(() => {
      setSimulatedProgress((previous) => {
        if (previous >= 94) {
          return previous;
        }
        if (previous < 28) {
          return Math.min(94, previous + 6);
        }
        if (previous < 56) {
          return Math.min(94, previous + 4);
        }
        if (previous < 80) {
          return Math.min(94, previous + 2.5);
        }
        return Math.min(94, previous + 1.2);
      });
    }, 420);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [controlledProgress, isVisible]);

  const displayedProgress = controlledProgress
    ? Math.max(0, Math.min(progress ?? 0, 100))
    : Math.max(8, Math.min(simulatedProgress, 94));

  const resolveStepIndex = (value: number) => {
    if (value < 20) return 0;
    if (value < 40) return 1;
    if (value < 60) return 2;
    if (value < 82) return 3;
    return 4;
  };

  const activeStepIndex = resolveStepIndex(controlledProgress ? animatedProgress : displayedProgress);
  const displayedStep = currentStepLabel || PROCESSING_STEPS[activeStepIndex]?.label || "Preparing dashboard";
  const completedStepIndex = displayedProgress >= 100
    ? PROCESSING_STEPS.length - 1
    : Math.max(-1, activeStepIndex - 1);

  useEffect(() => {
    if (!isVisible) {
      setAnimatedProgress(0);
      return;
    }

    let frameId = 0;

    const animate = () => {
      setAnimatedProgress((previous) => {
        const delta = displayedProgress - previous;
        if (Math.abs(delta) < 0.5) {
          return displayedProgress;
        }
        return previous + delta * 0.14;
      });

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [displayedProgress, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card p-8 sm:p-10 max-w-md w-full mx-4"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-ev-gold/20 bg-[radial-gradient(circle,rgba(0,212,255,0.18),transparent_70%)]">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-ev-gold/25 bg-black/40">
                  <Loader2 className="absolute h-5 w-5 animate-spin text-ev-gold/60" />
                  <span className="text-2xl font-display font-bold text-ev-text tabular-nums">
                    {Math.round(animatedProgress)}%
                  </span>
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-ev-text">
                Analyzing Resume
              </h2>
              <p className="text-sm text-ev-text-muted mt-1">
                {displayedStep}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {PROCESSING_STEPS.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center w-6 h-6 shrink-0">
                    {index <= completedStepIndex ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-ev-gold/20 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-ev-gold" />
                      </motion.div>
                    ) : index === activeStepIndex ? (
                      <div className="w-5 h-5 rounded-full border-2 border-ev-gold/50 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-ev-gold animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-ev-border" />
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      index <= activeStepIndex ? "text-ev-text" : "text-ev-text-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-8 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ev-gold/60 to-ev-gold rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${animatedProgress}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="mt-3 text-center text-xs text-ev-text-muted">
              {Math.round(animatedProgress)}% complete
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
