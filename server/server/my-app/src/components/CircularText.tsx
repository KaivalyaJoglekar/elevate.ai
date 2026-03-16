'use client';

import { motion } from 'framer-motion';

interface CircularTextProps {
  text: string;
  radius?: number;
  className?: string;
  duration?: number;
}

export const CircularText = ({ 
  text, 
  radius = 80, 
  className = '',
  duration = 20 
}: CircularTextProps) => {
  const characters = text.split('');
  const anglePerChar = 360 / characters.length;

  return (
    <motion.div 
      className={`relative ${className}`}
      style={{ width: radius * 2, height: radius * 2 }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {characters.map((char, i) => (
        <span
          key={i}
          className="absolute left-1/2 text-[10px] font-mono uppercase tracking-widest text-zinc-500"
          style={{
            transform: `
              translateX(-50%)
              rotate(${anglePerChar * i}deg)
              translateY(-${radius}px)
            `,
            transformOrigin: 'center center',
          }}
        >
          {char}
        </span>
      ))}
    </motion.div>
  );
};

// Decorative badge with rotating text
export const RotatingBadge = ({ 
  text = "CREATIVE • DEVELOPER • DESIGNER • ",
  centerText = "K",
  className = ""
}: { 
  text?: string; 
  centerText?: string;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      <CircularText text={text} radius={60} duration={15} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black text-white">{centerText}</span>
      </div>
    </div>
  );
};
