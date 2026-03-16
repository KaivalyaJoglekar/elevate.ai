'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export const SplitReveal = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const leftX = useTransform(scrollYProgress, [0, 0.5, 1], ['-100%', '0%', '0%']);
  const rightX = useTransform(scrollYProgress, [0, 0.5, 1], ['100%', '0%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const stats = [
    { value: '50+', label: 'Projects Completed' },
    { value: '5+', label: 'Years Experience' },
    { value: '30+', label: 'Happy Clients' },
    { value: '99%', label: 'Success Rate' },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-40 md:py-60 relative overflow-hidden"
    >
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.span 
          className="text-[30vw] font-black text-zinc-900/50 select-none whitespace-nowrap"
          style={{ x: leftX }}
        >
          CREATIVE
        </motion.span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Statement */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, ease: [0.25, 0.1, 0, 1] }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] mb-8">
              <span className="text-stroke">BUILDING</span>
              <br />
              <span className="text-white">DIGITAL</span>
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                EXPERIENCES
              </span>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed max-w-md">
              Transforming ideas into immersive digital experiences through 
              creative development and cutting-edge technology.
            </p>
          </motion.div>

          {/* Right - Stats */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0, 1] }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative p-6 border border-zinc-900 hover:border-purple-500/50 transition-colors duration-500"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <span className="block text-4xl md:text-5xl font-black text-white group-hover:text-purple-400 transition-colors mb-2">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-600 tracking-wider uppercase">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2" />
    </section>
  );
};
