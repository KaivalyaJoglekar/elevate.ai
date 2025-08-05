import React from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/solid'; // A simple icon that is perfect for spinning

interface FullScreenLoaderProps {
  isVisible: boolean;
  message: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/80 dark:bg-black/80 backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-6">
        
        {/* ✅ REPLACED: The previous SVG spinner is now a simple, guaranteed-to-spin icon. */}
        <motion.div
            // This applies a continuous 360-degree rotation.
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,      // The spin completes in 1 second.
              repeat: Infinity, // The animation will loop forever.
              ease: 'linear',   // The speed is constant for a smooth, non-stop spin.
            }}
        >
            <ArrowPathIcon className="w-12 h-12 text-brand-purple" />
        </motion.div>
        
        <motion.p
          key={message} // This ensures the text animates in when it changes
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-300 text-center max-w-xs text-lg"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default FullScreenLoader;