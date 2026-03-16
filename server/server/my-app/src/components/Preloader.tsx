'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader = ({ onComplete }: PreloaderProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 1000);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const letters = ['K', 'a', 'i', 'v', 'a', 'l', 'y', 'a'];
  const colors = ['#5852cb', '#6b65d4', '#818cf8', '#9890f0', '#a5b4fc', '#b5aef8', '#c4b5fd', '#a5b4fc'];

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Dark background layers */}
      <motion.div 
        className="absolute inset-0 bg-black"
        animate={isExiting ? { y: '-100%' } : { y: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div 
        className="absolute inset-0 bg-[#050505]"
        animate={isExiting ? { y: '-100%' } : { y: 0 }}
        transition={{ duration: 0.9, delay: 0.08, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Simple ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(88, 82, 203, 0.3) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Signature with animated letters */}
        <div className="relative">
          <div className="flex items-baseline">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  rotateX: -90,
                  filter: 'blur(10px)'
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  filter: 'blur(0px)'
                }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.3 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="inline-block font-serif italic"
                style={{
                  fontSize: i === 0 ? 'clamp(4rem, 15vw, 8rem)' : 'clamp(3rem, 12vw, 6rem)',
                  fontWeight: i === 0 ? 700 : 400,
                  color: colors[i],
                  textShadow: `0 0 40px ${colors[i]}50, 0 0 80px ${colors[i]}30`,
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Animated underline - purple/blue gradient */}
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-[2px] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#5852cb] via-violet-400 to-[#5852cb]"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.2, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>

          {/* Decorative dot */}
          <motion.div
            className="absolute -right-4 top-0 w-2 h-2 rounded-full bg-[#5852cb]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.2, duration: 0.3, type: 'spring' }}
          />
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.5 }}
          className="mt-8"
        >
          <span className="text-[11px] sm:text-xs tracking-[0.5em] text-zinc-500 uppercase">
            Creative Developer
          </span>
        </motion.div>

        {/* Loading bar - purple/blue gradient */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '12rem' }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 h-[2px] bg-zinc-900 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#5852cb] via-cyan-400 to-teal-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.8, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4"
        >
          <Counter />
        </motion.div>
      </div>

      {/* Corner decorations */}
      <motion.div 
        className="absolute top-8 left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <span className="text-[10px] tracking-[0.3em] text-zinc-700 font-light">2026</span>
      </motion.div>

      <motion.div 
        className="absolute top-8 right-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="w-8 h-8 border border-zinc-800 rounded-full flex items-center justify-center">
          <motion.div
            className="w-3 h-3 border-t border-r border-[#5852cb]/50 rounded-tr-sm"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>

      <motion.div 
        className="absolute bottom-8 left-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors[i] }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="absolute bottom-8 right-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <span className="text-[10px] tracking-[0.3em] text-zinc-700 uppercase font-light">Portfolio</span>
      </motion.div>
    </motion.div>
  );
};

const Counter = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 28);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-xs font-mono text-zinc-600 tabular-nums">{count}%</span>;
};
