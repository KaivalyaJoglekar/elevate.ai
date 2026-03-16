'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MagneticWrapper } from './animations';

const showcaseProjects = [
  {
    title: 'LUMINA',
    category: 'E-Commerce',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    color: '#8b5cf6',
  },
  {
    title: 'VELOCITY',
    category: 'Fintech',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    color: '#06b6d4',
  },
  {
    title: 'PRISM',
    category: 'Design System',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
    color: '#8b5cf6',
  },
  {
    title: 'AURORA',
    category: 'Creative',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800&q=80',
    color: '#06b6d4',
  },
];

export const HorizontalShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10 pointer-events-none" />
        
        {/* Section label */}
        <div className="absolute top-20 left-6 md:left-12 z-20">
          <span className="text-xs text-zinc-500 tracking-[0.3em] uppercase">/SHOWCASE</span>
        </div>

        {/* Horizontal scroll container */}
        <motion.div 
          className="flex gap-8 pl-[10vw]"
          style={{ x }}
        >
          {showcaseProjects.map((project, index) => (
            <MagneticWrapper key={index} strength={0.1}>
              <motion.div
                className="relative w-[60vw] md:w-[40vw] h-[60vh] flex-shrink-0 group cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                data-cursor-expand
                data-cursor-text="VIEW"
              >
                {/* Card */}
                <div className="relative w-full h-full overflow-hidden rounded-2xl bg-zinc-900">
                  {/* Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${project.image})` }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span 
                      className="text-xs tracking-[0.2em] uppercase mb-2 block"
                      style={{ color: project.color }}
                    >
                      {project.category}
                    </span>
                    <h3 className="text-4xl md:text-6xl font-black text-white group-hover:tracking-wider transition-all duration-500">
                      {project.title}
                    </h3>
                  </div>

                  {/* Number */}
                  <span className="absolute top-6 right-6 text-8xl font-black text-white/5">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Hover border */}
                  <motion.div
                    className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
                    style={{ borderColor: project.color }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </MagneticWrapper>
          ))}

          {/* End spacer */}
          <div className="w-[20vw] flex-shrink-0" />
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <motion.div
            className="w-20 h-[2px] bg-zinc-800 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-purple-500"
              style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
            />
          </motion.div>
          <span className="text-xs text-zinc-500">SCROLL</span>
        </div>
      </div>
    </section>
  );
};
