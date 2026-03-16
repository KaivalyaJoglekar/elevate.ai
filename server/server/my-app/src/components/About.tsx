'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const stats = [
  { value: 50, suffix: '+', label: 'Projects Completed' },
  { value: 5, suffix: '+', label: 'Years Experience' },
  { value: 30, suffix: '+', label: 'Happy Clients' },
  { value: 99, suffix: '%', label: 'Success Rate' },
];

const techStack = [
  { name: 'React', color: '#61DAFB' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Node.js', color: '#10b981' },
  { name: 'Three.js', color: '#5852cb' },
  { name: 'Tailwind', color: '#06B6D4' },
  { name: 'Framer', color: '#f472b6' },
  { name: 'PostgreSQL', color: '#4169E1' },
];

const roles = ['Developer', 'Designer', 'Creator', 'Innovator'];

// Animated counter component
const Counter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
};

// Rotating word animation
const RotatingWord = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-block w-48 h-[1.2em] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[index]}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-[#5852cb] to-indigo-400 bg-clip-text text-transparent"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

// Tech cube animation
const TechCube = ({ tech, delay }: { tech: { name: string; color: string }; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05, y: -2 }}
    className="relative p-4 bg-black/60 backdrop-blur-xl border border-zinc-800/50 rounded-xl cursor-default transition-all duration-300 hover:border-zinc-600 group overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${tech.color}10 0%, transparent 50%)` }} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 20px ${tech.color}15` }} />
    <div className="flex items-center gap-3 relative z-10">
      <div 
        className="w-2 h-2 rounded-full transition-shadow duration-300" 
        style={{ backgroundColor: tech.color, boxShadow: `0 0 0 rgba(${tech.color}, 0)` }}
      />
      <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{tech.name}</span>
    </div>
  </motion.div>
);

export const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section 
      id="about"
      ref={containerRef} 
      className="relative py-32 md:py-48 overflow-hidden "
    >
      {/* Noise/grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Multiple blobs */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(88, 82, 203, 0.15) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
        <div 
          className="absolute top-1/3 right-[10%] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 60%)', filter: 'blur(60px)' }}
        />
        <div 
          className="absolute bottom-1/4 left-[5%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)', filter: 'blur(70px)' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <span className="text-xs text-zinc-600 tracking-[0.3em] uppercase block mb-4">/ About</span>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            I&apos;m a <RotatingWord />
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left - Bio + Stats */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed mb-6">
              I craft <span className="text-white font-semibold">immersive digital experiences</span> that blend
              cutting-edge technology with thoughtful design.
            </p>
            <p className="text-base text-zinc-500 leading-relaxed mb-12">
              Specializing in interactive web applications, 3D graphics, and scalable architectures —
              from concept to production, every pixel and every line of code is intentional.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="p-6 bg-black/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-zinc-600 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Tech Stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="text-xs text-zinc-600 tracking-[0.3em] uppercase block mb-6">Tech Stack</span>
            <div className="grid grid-cols-2 gap-3">
              {techStack.map((tech, i) => (
                <TechCube key={tech.name} tech={tech} delay={0.3 + i * 0.05} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
