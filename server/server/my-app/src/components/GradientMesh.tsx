'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const GradientMesh = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030305]">
      {/* Main SVG mesh background */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Darker gradient definitions - reduced opacity */}
          <radialGradient id="meshBlob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.15)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <radialGradient id="meshBlob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.12)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <radialGradient id="meshBlob3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(79, 70, 229, 0.1)" />
            <stop offset="50%" stopColor="rgba(79, 70, 229, 0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <radialGradient id="meshBlob4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.08)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <radialGradient id="meshBlob5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.1)" />
            <stop offset="50%" stopColor="rgba(124, 58, 237, 0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          {/* Blur filters */}
          <filter id="meshBlur1" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
          </filter>
          <filter id="meshBlur2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
          </filter>
          <filter id="meshBlur3" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="120" />
          </filter>
        </defs>
        
        {/* Large organic blob - top right */}
        <motion.ellipse
          cx="1100"
          cy="150"
          rx="550"
          ry="450"
          fill="url(#meshBlob1)"
          filter="url(#meshBlur1)"
          animate={{
            cx: [1100, 1180, 1050, 1100],
            cy: [150, 220, 100, 150],
            rx: [550, 580, 520, 550],
            ry: [450, 420, 480, 450],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Medium blob - bottom left */}
        <motion.ellipse
          cx="200"
          cy="750"
          rx="500"
          ry="400"
          fill="url(#meshBlob2)"
          filter="url(#meshBlur1)"
          animate={{
            cx: [200, 280, 150, 200],
            cy: [750, 680, 800, 750],
            rx: [500, 470, 530, 500],
            ry: [400, 430, 380, 400],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Center blob */}
        <motion.ellipse
          cx="720"
          cy="450"
          rx="450"
          ry="350"
          fill="url(#meshBlob3)"
          filter="url(#meshBlur2)"
          animate={{
            cx: [720, 780, 660, 720],
            cy: [450, 500, 400, 450],
            rx: [450, 480, 420, 450],
            ry: [350, 320, 380, 350],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Accent blob - top left */}
        <motion.ellipse
          cx="50"
          cy="150"
          rx="400"
          ry="320"
          fill="url(#meshBlob4)"
          filter="url(#meshBlur2)"
          animate={{
            cx: [50, 100, 20, 50],
            cy: [150, 120, 180, 150],
            rx: [400, 370, 430, 400],
            ry: [320, 350, 300, 320],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Additional blob - right center */}
        <motion.ellipse
          cx="1350"
          cy="550"
          rx="420"
          ry="360"
          fill="url(#meshBlob5)"
          filter="url(#meshBlur3)"
          animate={{
            cx: [1350, 1300, 1400, 1350],
            cy: [550, 600, 500, 550],
            rx: [420, 450, 390, 420],
            ry: [360, 330, 390, 360],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bottom center blob */}
        <motion.ellipse
          cx="700"
          cy="900"
          rx="550"
          ry="350"
          fill="url(#meshBlob1)"
          filter="url(#meshBlur3)"
          animate={{
            cx: [700, 750, 650, 700],
            cy: [900, 920, 880, 900],
            rx: [550, 520, 580, 550],
            ry: [350, 380, 320, 350],
          }}
          transition={{
            duration: 36,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Additional DOM-based mesh blobs for layering - darker versions */}
      <motion.div
        className="absolute w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] -top-[25%] -right-[20%]"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.08, 0.95, 1],
          rotate: [0, 5, -3, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.06) 0%, rgba(139, 92, 246, 0.02) 40%, transparent 70%)',
          filter: 'blur(100px)',
          borderRadius: '40% 60% 55% 45% / 55% 45% 60% 40%',
        }}
      />

      <motion.div
        className="absolute w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] -bottom-[20%] -left-[25%]"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -25, 0],
          scale: [1, 0.95, 1.06, 1],
          rotate: [0, -4, 3, 0],
        }}
        transition={{
          duration: 38,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.015) 40%, transparent 70%)',
          filter: 'blur(90px)',
          borderRadius: '55% 45% 50% 50% / 45% 55% 45% 55%',
        }}
      />

      <motion.div
        className="absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] top-[25%] left-[20%]"
        animate={{
          x: [0, 35, -20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.04, 0.94, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.04) 0%, rgba(79, 70, 229, 0.01) 50%, transparent 70%)',
          filter: 'blur(80px)',
          borderRadius: '45% 55% 60% 40% / 50% 50% 50% 50%',
        }}
      />

      {/* Subtle dark accent blob */}
      <motion.div
        className="absolute w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bottom-[15%] right-[5%]"
        animate={{
          x: [0, -25, 35, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.05, 0.92, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.04) 0%, rgba(124, 58, 237, 0.01) 50%, transparent 70%)',
          filter: 'blur(70px)',
          borderRadius: '50% 50% 45% 55% / 55% 45% 55% 45%',
        }}
      />

      {/* Moving highlight streaks */}
      <motion.div
        className="absolute w-[2px] h-[30vh] top-[10%] left-[20%]"
        animate={{
          y: [0, 100, 0],
          opacity: [0, 0.03, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.2), transparent)',
          filter: 'blur(4px)',
        }}
      />
      
      <motion.div
        className="absolute w-[2px] h-[25vh] top-[30%] right-[30%]"
        animate={{
          y: [0, -80, 0],
          opacity: [0, 0.02, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: 3,
          ease: 'easeInOut',
        }}
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(168, 85, 247, 0.15), transparent)',
          filter: 'blur(3px)',
        }}
      />

      {/* Noise texture overlay - subtle */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Strong vignette overlay for darker edges */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(3, 3, 5, 0.4) 50%, #030305 100%)',
        }}
      />
      
      {/* Additional corner darkness */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, rgba(3, 3, 5, 0.6) 0%, transparent 40%),
            linear-gradient(225deg, rgba(3, 3, 5, 0.6) 0%, transparent 40%),
            linear-gradient(315deg, rgba(3, 3, 5, 0.5) 0%, transparent 40%),
            linear-gradient(45deg, rgba(3, 3, 5, 0.5) 0%, transparent 40%)
          `,
        }}
      />
    </div>
  );
};
