'use client';

import { motion } from 'framer-motion';

export const Marquee = () => {
  const items = ['FULL-STACK', '◆', 'UI/UX', '◆', 'THREE.JS', '◆', 'NEXT.JS', '◆', 'CREATIVE', '◆', 'DEVELOPER', '◆'];
  
  return (
    <div className="py-6 border-y border-zinc-800/50 overflow-hidden bg-black/30 backdrop-blur-sm">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, '-50%'] }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-8">
            {items.map((item, j) => (
              <span 
                key={j} 
                className={`text-3xl md:text-5xl font-black tracking-tighter ${
                  item === '◆' ? 'text-purple-500' : 'text-stroke'
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
