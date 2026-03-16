'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MagneticWrapper } from './animations';

const marqueeText = "KAIVALYA JOGLEKAR • SOFTWARE ENGINEER • CREATIVE DEVELOPER • ";

export const Footer = () => {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-50px" });
  const [hovering, setHovering] = useState(false);
  const [time, setTime] = useState('');
  const year = new Date().getFullYear();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Kolkata',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="relative overflow-hidden"
    >
      {/* Infinite Marquee */}
      <div className="py-12 border-t border-b border-zinc-800/50 overflow-hidden">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: hovering ? 0 : '-50%' }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop'
          }}
          onHoverStart={() => setHovering(true)}
          onHoverEnd={() => setHovering(false)}
        >
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight px-8 bg-gradient-to-r from-zinc-900/80 via-[#5852cb]/20 to-zinc-900/80 bg-clip-text text-transparent" style={{ WebkitTextStroke: '1px rgba(88, 82, 203, 0.1)' }}>
              {marqueeText}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        {/* Main Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="grid md:grid-cols-4 gap-10 mb-16"
        >
          {/* Logo/Name */}
          <div className="md:col-span-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <h3 className="text-3xl md:text-4xl font-bold">
                <span className="text-white">K</span>
                <span className="text-zinc-600">.</span>
              </h3>
            </motion.div>
            <p className="text-zinc-600 text-sm mt-4 max-w-xs">
              Crafting digital experiences with precision and purpose. Let&apos;s build something remarkable.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs text-zinc-600 uppercase tracking-widest mb-4">Navigate</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Work', 'Contact'].map((item, i) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 * i }}
                >
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-zinc-500 hover:text-white transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-white group-hover:w-3 transition-all" />
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Time Widget */}
          <div>
            <h4 className="text-xs text-zinc-600 uppercase tracking-widest mb-4">India Time</h4>
            <div className="bg-black/60 border border-zinc-800 rounded-xl p-4">
              <div className="font-mono text-2xl text-[#5852cb] tabular-nums">
                {time}
              </div>
              <div className="text-xs text-zinc-600 mt-1">IST (UTC+5:30)</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-zinc-800/50"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          {/* Copyright */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-700">© {year}</span>
            <span className="text-zinc-800">•</span>
            <span className="text-xs text-zinc-600">Designed & Built by <span className="text-zinc-400">Kaivalya</span></span>
          </div>
          
          {/* Back to top */}
          <MagneticWrapper strength={0.4}>
            <motion.button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group relative flex items-center gap-3"
              whileHover={{ y: -2 }}
            >
              <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-wider">
                Back to top
              </span>
              <div className="w-10 h-10 rounded-full border border-zinc-800 group-hover:border-[#5852cb]/50 flex items-center justify-center transition-all group-hover:bg-[#5852cb]/10">
                <motion.span 
                  className="text-zinc-600 group-hover:text-[#5852cb] transition-colors"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ↑
                </motion.span>
              </div>
            </motion.button>
          </MagneticWrapper>
        </motion.div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </footer>
  );
};
