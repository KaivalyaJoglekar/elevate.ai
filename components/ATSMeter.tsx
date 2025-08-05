import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

interface AtsScoreCardProps {
  score: number;
  feedback: string;
}

const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ score, feedback }) => {
  const { theme } = useTheme();
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const scoreColor = score > 85 ? 'text-green-500 dark:text-green-400' : score > 70 ? 'text-sky-500 dark:text-sky-400' : 'text-violet-500 dark:text-violet-400';

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 2,
      delay: 0.5, // Start animation slightly after the card appears
      ease: [0.16, 1, 0.3, 1], // A more dramatic ease-out curve
    });
    return controls.stop;
  }, [score, count]);

  return (
    <motion.div 
      className="bg-white/50 dark:bg-transparent border border-brand-purple/50 dark:border-neutral-800 rounded-2xl p-6 h-full shadow-glow"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
        <motion.h2 
          className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-light-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
        >
          ATS Compatibility
        </motion.h2>
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            className="relative w-40 h-40 shrink-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.4, duration: 0.5 } }}
          >
            <svg className="w-full h-full" viewBox="0 0 160 160">
              {/* ✅ FIXED: Replaced the gradient with a more vibrant, multi-color diagonal one. */}
              <defs>
                <linearGradient id="cool-ats-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#8b5cf6' }} />   {/* Violet-500 */}
                  <stop offset="50%" style={{ stopColor: '#ec4899' }} />  {/* Pink-500 */}
                  <stop offset="100%" style={{ stopColor: '#f97316' }} /> {/* Orange-500 */}
                </linearGradient>
              </defs>
              <circle
                cx="80" cy="80" r={radius}
                fill="none" stroke={theme === 'dark' ? "#262626" : "#e5e7eb"} strokeWidth="12"
              />
              <motion.circle
                cx="80" cy="80" r={radius}
                fill="none"
                stroke="url(#cool-ats-gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                  className={`text-4xl font-bold ${scoreColor}`}
              >
                {rounded}
              </motion.span>
              <span className="text-sm font-medium text-gray-500 dark:text-subtle-text">/ 100</span>
            </div>
          </motion.div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.2 } }}
          >
              <p className="text-gray-600 dark:text-subtle-text">{feedback}</p>
          </motion.div>
        </div>
    </motion.div>
  );
};

export default AtsScoreCard;