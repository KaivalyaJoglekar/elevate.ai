'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MagneticWrapper } from './animations';

export const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center overflow-hidden px-6 lg:px-12 py-20"
    >
      <div className="relative z-20 w-full max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[60vh]">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -50 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-sm text-zinc-400 font-medium uppercase tracking-wider">
                Available for Work
              </span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-2">
              <motion.h1 
                className="text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.95] tracking-tighter"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="block text-white">Kaivalya</span>
                <span className="block bg-gradient-to-r from-[#5852cb] via-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">
                  Joglekar
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex items-center gap-4 pt-4"
              >
                <div className="h-px w-12 bg-zinc-800" />
                <p className="text-xl md:text-2xl text-zinc-400 font-light">
                  Full Stack Developer & Creative Technologist
                </p>
              </motion.div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-lg text-zinc-500 leading-relaxed max-w-xl"
            >
              Crafting exceptional digital experiences through the intersection of design and technology. 
              Specializing in modern web applications with immersive interactions.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-wrap items-center gap-5 pt-6"
            >
              <MagneticWrapper strength={0.3}>
                <a
                  href="#work"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-transform active:scale-95"
                >
                  <span className="relative z-10">View Work</span>
                  <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5852cb] to-[#7c3aed] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="absolute inset-0 bg-white opacity-100 group-hover:opacity-0 transition-opacity" /> {/* White bg fades out */}
                  <span className="absolute z-10 inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold gap-3">
                    View Work <span className="translate-x-1">→</span>
                  </span>
                </a>
              </MagneticWrapper>

              <a
                href="#contact"
                className="group inline-flex items-center gap-2 px-6 py-4 text-zinc-400 hover:text-white transition-colors font-medium text-lg"
              >
                Contact Me
              </a>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="grid grid-cols-3 gap-8 pt-12 border-t border-zinc-800/50 w-full max-w-md"
            >
              <div>
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">5+</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Years</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">30+</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Clients</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual Filler (Empty to let global grid show through significantly) */}
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:block relative h-full min-h-[400px]"
          >
           {/* We leave this area open so the new ElevatedGridBackground shines through. 
               Maybe add a very subtle floating element? */}
             <motion.div 
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full"
               animate={{ rotate: 360 }}
               transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             />
             <motion.div 
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full"
               animate={{ rotate: -360 }}
               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             />
          </motion.div>
        </div>
      </div>
      
       {/* Scroll Indicator */}
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-zinc-500 to-transparent" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Scroll</span>
      </motion.div>
    </section>
  );
};
