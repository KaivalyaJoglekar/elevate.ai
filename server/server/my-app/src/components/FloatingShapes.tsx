'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const shapes = [
  { type: 'circle', size: 300, color: 'rgba(139, 92, 246, 0.03)', blur: 80 },
  { type: 'circle', size: 400, color: 'rgba(6, 182, 212, 0.03)', blur: 100 },
  { type: 'circle', size: 200, color: 'rgba(139, 92, 246, 0.05)', blur: 60 },
  { type: 'square', size: 150, color: 'rgba(6, 182, 212, 0.02)', blur: 40 },
  { type: 'circle', size: 250, color: 'rgba(255, 255, 255, 0.02)', blur: 70 },
];

export const FloatingShapes = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.type === 'circle' ? 'rounded-full' : 'rounded-3xl'}`}
          style={{
            width: shape.size,
            height: shape.size,
            background: shape.color,
            filter: `blur(${shape.blur}px)`,
            left: `${(index * 25) % 100}%`,
            top: `${(index * 30) % 100}%`,
          }}
          animate={{
            x: [0, 100, -50, 100, 0],
            y: [0, -100, 50, -50, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 30 + index * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Gradient orbs that follow mouse slightly */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          left: '10%',
          top: '20%',
        }}
        animate={{
          x: [0, 50, -30, 50, 0],
          y: [0, -30, 50, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
          right: '5%',
          bottom: '10%',
        }}
        animate={{
          x: [0, -40, 30, -40, 0],
          y: [0, 40, -30, 40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
