'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export const TextScramble = ({ 
  text, 
  className = '', 
  delay = 0,
  speed = 50 
}: TextScrambleProps) => {
  const [displayText, setDisplayText] = useState(text.split('').map(() => ' ').join(''));
  const [isComplete, setIsComplete] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scramble = useCallback(() => {
    let iteration = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      iteration += 1 / 3;

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(scramble, delay);
      return () => clearTimeout(timeout);
    }
  }, [isInView, scramble, delay]);

  return (
    <motion.span
      ref={ref}
      className={`${className} font-mono`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
    >
      {displayText}
    </motion.span>
  );
};

// Glitch text effect
export const GlitchText = ({ 
  text, 
  className = '' 
}: { 
  text: string; 
  className?: string;
}) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span 
        className="absolute inset-0 text-purple-500 opacity-70 animate-pulse"
        style={{ 
          clipPath: 'inset(10% 0 60% 0)',
          transform: 'translateX(-2px)',
        }}
        aria-hidden
      >
        {text}
      </span>
      <span 
        className="absolute inset-0 text-cyan-400 opacity-70 animate-pulse"
        style={{ 
          clipPath: 'inset(60% 0 10% 0)',
          transform: 'translateX(2px)',
          animationDelay: '0.1s',
        }}
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
};
