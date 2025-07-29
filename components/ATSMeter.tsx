import React, { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

interface AtsScoreCardProps {
  score: number;
  feedback: string;
}

const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ score, feedback }) => {
  const { theme } = useTheme();
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const scoreColor = score > 85 ? 'text-green-500 dark:text-green-400' : score > 70 ? 'text-sky-500 dark:text-sky-400' : 'text-yellow-500 dark:text-yellow-400';
  
  const ringColor = score > 85 ? '#22c55e' : score > 70 ? '#0ea5e9' : '#eab308';
  const ringGlow = score > 85 ? '0 0 20px rgba(34, 197, 94, 0.4)' : score > 70 ? '0 0 20px rgba(14, 165, 233, 0.4)' : '0 0 20px rgba(234, 179, 8, 0.4)';
  
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        setAnimatedScore(value);
        if (scoreRef.current) {
          scoreRef.current.textContent = Math.round(value).toString();
        }
      }
    });
    return () => controls.stop();
  }, [score]);


  return (
    <div 
      className="bg-transparent border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 h-full shadow-glow"
    >
        <h2 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-light-text">ATS Compatibility</h2>
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 160 160">
              <circle
                cx="80" cy="80" r={radius}
                fill="none" stroke={theme === 'dark' ? "#262626" : "#e5e7eb"} strokeWidth="12"
              />
              <motion.circle
                cx="80" cy="80" r={radius}
                fill="none" stroke={ringColor} strokeWidth="12"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "circOut" }}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span 
                  ref={scoreRef}
                  className={`text-4xl font-bold ${scoreColor}`}
              >
                0
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-subtle-text">/ 100</span>
            </div>
          </div>
          <div className="text-center">
              <p className="text-gray-600 dark:text-subtle-text">{feedback}</p>
          </div>
        </div>
    </div>
  );
};

export default AtsScoreCard;