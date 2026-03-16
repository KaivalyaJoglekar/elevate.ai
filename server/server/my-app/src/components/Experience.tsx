'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { MagneticWrapper } from './animations';

const experiences = [
  {
    role: 'Senior Frontend Engineer',
    company: 'TechCorp',
    period: '2023 — Present',
    duration: '2 years',
    description: 'Leading frontend architecture for enterprise SaaS products serving millions of users globally.',
    highlights: ['Led team of 5 engineers', 'Reduced load time by 60%', 'Shipped 15+ major features'],
    skills: ['React', 'TypeScript', 'GraphQL', 'AWS'],
    color: 'from-indigo-500 to-violet-500',
  },
  {
    role: 'Creative Developer',
    company: 'Studio Digital',
    period: '2021 — 2023',
    duration: '2 years',
    description: 'Crafted immersive web experiences with WebGL, Three.js, and cutting-edge motion design.',
    highlights: ['Won 3 Awwwards', 'Built 20+ interactive sites', 'Mentored junior devs'],
    skills: ['Three.js', 'GSAP', 'WebGL', 'Framer Motion'],
    color: 'from-violet-500 to-purple-500',
  },
  {
    role: 'Full Stack Developer',
    company: 'StartupX',
    period: '2019 — 2021',
    duration: '2 years',
    description: 'Built core features for a fast-growing fintech platform from ground up to acquisition.',
    highlights: ['$50M acquisition', '100K+ active users', 'Zero downtime deployment'],
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    color: 'from-indigo-400 to-[#5852cb]',
  },
];

// Timeline node component
const TimelineNode = ({ isActive, color }: { isActive: boolean; color: string }) => (
  <div className="relative flex items-center justify-center">
    {/* Glow effect */}
    <motion.div 
      className={`absolute w-8 h-8 rounded-full bg-gradient-to-r ${color} blur-xl`}
      animate={{ opacity: isActive ? 0.6 : 0, scale: isActive ? 1.2 : 1 }}
      transition={{ duration: 0.3 }}
    />
    {/* Node */}
    <motion.div 
      className={`relative w-4 h-4 rounded-full border-2 z-10 transition-all duration-300 ${
        isActive 
          ? `bg-gradient-to-r ${color} border-transparent` 
          : ' border-zinc-700'
      }`}
      animate={{ scale: isActive ? 1.2 : 1 }}
    />
  </div>
);

// Experience card component
const ExperienceCard = ({ exp, index, isActive, setActive }: { 
  exp: typeof experiences[0]; 
  index: number;
  isActive: boolean;
  setActive: (i: number | null) => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setActive(index)}
      onMouseLeave={() => setActive(null)}
      className="group"
    >
      <motion.div
        className={`relative p-6 md:p-8 rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
          isActive 
            ? 'bg-black/80 border-zinc-700/50 shadow-2xl' 
            : 'bg-black/40 border-zinc-800/30'
        }`}
        animate={{ y: isActive ? -5 : 0 }}
      >
        {/* Gradient overlay */}
        <motion.div 
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${exp.color} opacity-0 transition-opacity duration-500`}
          animate={{ opacity: isActive ? 0.05 : 0 }}
        />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div>
              <motion.h3 
                className="text-xl md:text-2xl font-bold text-white"
                animate={{ x: isActive ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {exp.role}
              </motion.h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${exp.color} font-semibold`}>
                  {exp.company}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500 text-sm">{exp.duration}</span>
              </div>
            </div>
            <span className="text-xs font-mono text-zinc-600 bg-black/60 px-3 py-1 rounded-full self-start">
              {exp.period}
            </span>
          </div>
          
          {/* Description */}
          <p className="text-zinc-400 leading-relaxed mb-4">{exp.description}</p>
          
          {/* Highlights - visible on hover */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-zinc-800/50">
              <span className="text-xs text-zinc-600 uppercase tracking-widest mb-3 block">Key Achievements</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {exp.highlights.map((highlight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${exp.color}`} />
                    <span className="text-sm text-zinc-300">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {exp.skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-black/80 text-zinc-300 border border-zinc-700' 
                    : 'bg-black/60 text-zinc-500 border border-zinc-800/50'
                }`}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Experience = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeExp, setActiveExp] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 0.8], ['0%', '100%']);

  return (
    <section 
      ref={containerRef}
      id="experience"
      className="py-32 md:py-48 relative overflow-hidden"
    >
      {/* Noise/grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Multiple gradient blobs */}
      <div 
        className="absolute top-[15%] right-[5%] w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(88, 82, 203, 0.15) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      <div 
        className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 60%)', filter: 'blur(50px)' }}
      />
      <div 
        className="absolute top-[50%] left-[30%] w-[300px] h-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      <div 
        className="absolute bottom-[40%] right-[20%] w-[250px] h-[250px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)', filter: 'blur(50px)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <span className="text-xs text-zinc-600 tracking-[0.3em] uppercase block mb-4">/ Experience</span>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Work History</h2>
        </motion.div>

        {/* Timeline + Cards */}
        <div className="relative">
          {/* Animated vertical line */}
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-zinc-800/50 overflow-hidden">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-gradient-to-b from-[#5852cb] to-violet-500"
            />
          </div>

          <div className="space-y-8 pl-10">
            {experiences.map((exp, i) => (
              <div key={i} className="relative flex items-start gap-6">
                <div className="absolute -left-10 top-6">
                  <TimelineNode isActive={activeExp === i} color={exp.color} />
                </div>
                <div className="flex-1">
                  <ExperienceCard
                    exp={exp}
                    index={i}
                    isActive={activeExp === i}
                    setActive={setActiveExp}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Download */}
        <motion.div 
          className="mt-20 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <MagneticWrapper strength={0.3}>
            <a 
              href="#" 
              className="group relative px-8 py-4 overflow-hidden rounded-full"
            >
              <div className="absolute inset-0 bg-[#5852cb] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 border border-zinc-700 group-hover:border-transparent rounded-full transition-colors duration-300" />
              <span className="relative z-10 flex items-center gap-4 text-sm uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                Download Resume
                <motion.span animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>↓</motion.span>
              </span>
            </a>
          </MagneticWrapper>
        </motion.div>
      </div>
    </section>
  );
};
