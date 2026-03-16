// components/ATSMeter.tsx

import React, { useEffect, memo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AtsScoreCardProps {
  score: number;
  feedback: string;
}

const AtsScoreCard: React.FC<AtsScoreCardProps> = memo(({ score, feedback }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const isHighScore = score > 85;
  const isMidScore = score > 70;

  const scoreColor = isHighScore
    ? 'text-emerald-400'
    : isMidScore
      ? 'text-accent-secondary'
      : 'text-orange-400';

  const scoreLabelColor = isHighScore
    ? 'text-emerald-400'
    : isMidScore
      ? 'text-accent-secondary'
      : 'text-orange-400';

  const progressArcColor = isHighScore
    ? '#34d399'
    : isMidScore
      ? '#22d3ee'
      : '#fb923c';

  const scoreLabel = isHighScore ? 'Excellent' : isMidScore ? 'Good' : 'Needs Work';

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 2.2,
      delay: 0.5,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [score, count]);

  return (
    <motion.div
      className="bg-black/45 rounded-2xl border border-white/[0.08] relative h-full overflow-hidden p-6 transition-all duration-300 hover:border-accent-secondary/30"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative z-10">
        <motion.h2
          className="mb-5 text-center font-display text-lg font-bold text-light-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
        >
          ATS Compatibility
        </motion.h2>

        <div className="flex flex-col items-center gap-5">
          {/* Circular gauge */}
          <motion.div
            className="relative w-44 h-44"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.35, duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
          >
            <svg className="w-full h-full" viewBox="0 0 160 160">
              {/* Track */}
              <circle
                cx="80" cy="80" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="12"
              />
              {/* Progress arc */}
              <motion.circle
                cx="80" cy="80" r={radius}
                fill="none"
                stroke={progressArcColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                transition={{ duration: 2.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                transform="rotate(-90 80 80)"
              />
            </svg>

            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <motion.span className={`text-5xl font-black tabular-nums ${scoreColor}`}>
                {rounded}
              </motion.span>
              <span className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase mt-1">/ 100</span>
            </div>
          </motion.div>

          {/* Score label badge */}
          <motion.span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${scoreLabelColor}
              ${isHighScore ? 'bg-emerald-500/10 border-emerald-500/30' : isMidScore ? 'bg-accent-secondary/10 border-accent-secondary/30' : 'bg-orange-500/10 border-orange-500/30'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 1.2 } }}
          >
            {scoreLabel}
          </motion.span>

          {/* Feedback */}
          <motion.p
            className="text-[15px] font-medium text-center text-light-text leading-relaxed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.3 } }}
          >
            {feedback}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
});

export default AtsScoreCard;