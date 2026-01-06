import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/solid'; 

interface FullScreenLoaderProps {
  isVisible: boolean;
  message: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isVisible, message }) => {

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-xl transition-all duration-500"
    >
      <div className="relative flex flex-col items-center gap-8 p-10 rounded-3xl bg-white/40 dark:bg-zinc-900/50 border border-white/50 dark:border-white/10 shadow-2xl backdrop-blur-md max-w-sm w-full mx-4">
        
        <div className="relative">
             {/* Pulse effect behind the spinner */}
            <motion.div
                className="absolute inset-0 bg-brand-purple/30 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                }}
            >
                <ArrowPathIcon className="w-16 h-16 text-brand-purple drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] relative z-10" />
            </motion.div>
        </div>
        
        <div className="text-center w-full space-y-4">
            <motion.p
            key={message} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-800 dark:text-white font-semibold text-lg tracking-wide"
            >
            {message}
            </motion.p>
            
            {/* Progress bar simulation */}
            <div className="w-full h-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-brand-purple to-pink-500 box-shadow-glow"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </div>

      </div>
    </div>
  );
};



export default FullScreenLoader;