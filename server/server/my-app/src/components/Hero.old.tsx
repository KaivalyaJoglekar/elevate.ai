'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MagneticWrapper } from './animations';

// Animated counter
const Counter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = value / 60;
          const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
};

// Rotating roles
const roles = [
  'Full Stack Developer',
  'UI/UX Designer', 
  'Creative Technologist',
  'Problem Solver'
];

const RotatingRole = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % roles.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-block min-h-[1.2em] align-bottom min-w-[320px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[index]}
          initial={{ y: 60, opacity: 0, rotateX: 90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -60, opacity: 0, rotateX: -90 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 bg-gradient-to-r from-[#5852cb] via-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent font-bold"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

// Tech stack with icons
const techStack = [
  { name: 'React', icon: '⚛️' },
  { name: 'Next.js', icon: '▲' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Three.js', icon: '🎨' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Tailwind', icon: '💨' },
  { name: 'Framer', icon: '🎭' },
  { name: 'PostgreSQL', icon: '🐘' },
];

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => { setMounted(true); }, []);

  const stats = [
    { value: 50, suffix: '+', label: 'Projects Delivered' },
    { value: 5, suffix: '+', label: 'Years Experience' },
    { value: 30, suffix: '+', label: 'Happy Clients' },
  ];

  return (
    <section ref={containerRef} className="relative min-h-screen bg-[#030305] overflow-hidden">
      {/* Grid Background - Same as Work section */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(88, 82, 203, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(88, 82, 203, 1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Gradient blobs */}
      <div
        className="absolute top-[10%] right-[10%] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(88, 82, 203, 0.15) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute top-[50%] left-[30%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 60%)', filter: 'blur(50px)' }}
      />
      <div
        className="absolute bottom-[40%] right-[20%] w-[250px] h-[250px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <motion.div style={{ y, opacity }} className="relative z-10 min-h-screen flex items-center px-6 md:px-12 lg:px-20 pt-32 pb-20">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Main Hero Content */}
          <div className="max-w-5xl mx-auto text-center mb-20">
            
            {/* Status Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.9 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 inline-block"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                </span>
                <span className="text-sm text-zinc-300 font-medium">Available for exciting projects</span>
              </div>
            </motion.div>

            {/* Hero Heading with Gradient */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 40 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-black leading-[1.05] tracking-tight">
                <span className="block text-white mb-2">
                  Hi, I'm{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-[#5852cb] via-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">
                      Kaivalya
                    </span>
                    <motion.span
                      className="absolute -inset-4 bg-[#5852cb]/20 blur-2xl rounded-full -z-10"
                      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </span>
                </span>
                <span className="block text-zinc-400 text-[clamp(1.8rem,5vw,4rem)] mt-2">
                  A{' '}
                </span>
                <RotatingRole />
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Crafting exceptional digital experiences that merge beautiful design with powerful technology.{' '}
              <span className="text-zinc-500">Based in India, working with clients worldwide.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap gap-5 justify-center mb-16"
            >
              <MagneticWrapper strength={0.2}>
                <motion.a
                  href="#work"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#5852cb] to-[#7c3aed] text-white font-bold rounded-2xl overflow-hidden shadow-lg shadow-[#5852cb]/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Explore My Work</span>
                  <motion.span 
                    className="relative z-10"
                    animate={{ x: [0, 5, 0] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.a>
              </MagneticWrapper>
              
              <MagneticWrapper strength={0.15}>
                <motion.a
                  href="#contact"
                  className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-zinc-700/50 text-zinc-300 font-bold rounded-2xl hover:border-[#5852cb]/50 hover:text-white transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get In Touch
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
                </motion.a>
              </MagneticWrapper>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-wrap gap-8 justify-center mb-16"
            >
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} 
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-center px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-sm">
                    <span className="block text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent mb-2">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </span>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
                      {stat.label}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#5852cb]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </motion.div>
              ))}
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-zinc-700" />
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Tech Stack</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-zinc-700" />
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {techStack.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="group relative px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-[#5852cb]/40 transition-all cursor-default backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg group-hover:scale-125 transition-transform">{tech.icon}</span>
                      <span className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {tech.name}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-[#5852cb]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-zinc-700/50 rounded-full flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-2 bg-[#5852cb] rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
