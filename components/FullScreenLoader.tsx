import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

interface FullScreenLoaderProps {
  isVisible: boolean;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isVisible }) => {
  const { theme } = useTheme();
  
  if (!isVisible) return null;

  const backdropClass = theme === 'dark' 
    ? 'bg-black bg-opacity-30 backdrop-blur-md'
    : 'bg-gray-50 bg-opacity-90 backdrop-blur-sm';
    
  const grainTexture = theme === 'light' 
    ? 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" stitchTiles="stitch"/%3E%3CfeColorMatrix values="0 0 0 0 0.7 0 0 0 0 0.7 0 0 0 0 0.7 0 0 0 0.08 0"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E'
    : null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClass}`}
      style={{
        backgroundImage: grainTexture ? `url("${grainTexture}")` : undefined,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px'
      }}
    >
      <div className="flex flex-col items-center">
        {/* LED Radar Scanner */}
        <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
          {[220, 180, 140, 100].map((size, index) => (
            <motion.div
              key={`radar-ring-${size}`}
              className="absolute rounded-full border-2"
              style={{
                width: size,
                height: size,
                background: 'transparent',
                borderColor: theme === 'dark' 
                  ? `rgba(45, 212, 191, ${0.7 - index * 0.1})` 
                  : `rgba(20, 184, 166, ${0.8 - index * 0.1})`,
                boxShadow: `0 0 15px rgba(45, 212, 191, ${0.3 - index * 0.05})`,
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3,
              }}
            />
          ))}
          
          {/* Teal crosshairs */}
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-teal-500/60 to-transparent"></div>
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-teal-500/60 to-transparent"></div>
          
          {/* Small color-changing sweep */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              filter: 'blur(1px)',
            }}
            animate={{
              rotate: 360,
              background: [
                'conic-gradient(from 0deg, transparent 0deg, rgba(239, 68, 68, 0.6) 15deg, transparent 45deg)',
                'conic-gradient(from 0deg, transparent 0deg, rgba(251, 146, 60, 0.6) 15deg, transparent 45deg)',
                'conic-gradient(from 0deg, transparent 0deg, rgba(251, 191, 36, 0.6) 15deg, transparent 45deg)',
                'conic-gradient(from 0deg, transparent 0deg, rgba(34, 197, 94, 0.6) 15deg, transparent 45deg)',
                'conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.6) 15deg, transparent 45deg)',
                'conic-gradient(from 0deg, transparent 0deg, rgba(139, 92, 246, 0.6) 15deg, transparent 45deg)',
                'conic-gradient(from 0deg, transparent 0deg, rgba(236, 72, 153, 0.6) 15deg, transparent 45deg)',
                'conic-gradient(from 0deg, transparent 0deg, rgba(239, 68, 68, 0.6) 15deg, transparent 45deg)',
              ]
            }}
            transition={{
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              },
              background: {
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          />
          
          {/* Toastify Green center core */}
          <motion.div 
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, #2dd4bf, #22c55e)',
              boxShadow: '0 0 20px #2dd4bf, 0 0 40px #2dd4bf40',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Modern Text */}
        <motion.h2
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500 mb-2"
          animate={{
            opacity: [0.8, 1, 0.8],
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        >
          AI Analysis in Progress
        </motion.h2>
        
        <motion.p
          className="text-gray-600 dark:text-subtle-text text-center max-w-xs"
          animate={{
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Advanced algorithms processing your profile data...
        </motion.p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
