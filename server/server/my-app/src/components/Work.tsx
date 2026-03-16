'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { MagneticWrapper } from './animations';

const projects = [
  {
    id: 1,
    title: 'LUMINA',
    category: 'E-Commerce',
    description: 'AI-powered shopping experience with personalized recommendations and seamless checkout flow.',
    tags: ['Next.js', 'Shopify', 'OpenAI', 'Stripe'],
    year: '2025',
    gradient: 'from-[#5852cb] to-indigo-600',
    image: '/projects/lumina.jpg',
    metrics: { users: '2M+', conversion: '+45%' },
  },
  {
    id: 2,
    title: 'VELOCITY',
    category: 'FinTech',
    description: 'Real-time trading dashboard with sub-millisecond data streaming and predictive analytics.',
    tags: ['React', 'WebSocket', 'Rust', 'D3.js'],
    year: '2024',
    gradient: 'from-blue-500 to-indigo-600',
    image: '/projects/velocity.jpg',
    metrics: { transactions: '50M+', latency: '<1ms' },
  },
  {
    id: 3,
    title: 'PRISM',
    category: 'Design System',
    description: 'Comprehensive component library powering 12 products across multiple platforms.',
    tags: ['TypeScript', 'Storybook', 'Radix', 'Figma'],
    year: '2024',
    gradient: 'from-violet-500 to-purple-600',
    image: '/projects/prism.jpg',
    metrics: { components: '200+', products: '12' },
  },
  {
    id: 4,
    title: 'AURORA',
    category: 'Creative Agency',
    description: '3D interactive portfolio showcasing award-winning creative work with immersive storytelling.',
    tags: ['Three.js', 'GSAP', 'WebGL', 'Blender'],
    year: '2023',
    gradient: 'from-indigo-500 to-[#5852cb]',
    image: '/projects/aurora.jpg',
    metrics: { awards: '5', views: '500K+' },
  },
];

// Floating preview card component
const ProjectPreview = ({ project, isActive }: { project: typeof projects[0]; isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
      >
        <div className={`w-80 h-48 rounded-2xl bg-gradient-to-br ${project.gradient} p-1`}>
          <div className="w-full h-full bg-black/90 backdrop-blur-xl rounded-xl p-4 flex flex-col justify-between">
            <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>
            <div className="flex gap-4">
              {Object.entries(project.metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">{key}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Project card component
const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.1, 0, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Preview */}
      <ProjectPreview project={project} isActive={isHovered} />
      
      <div className="relative overflow-hidden rounded-2xl bg-black/60 backdrop-blur-xl border border-zinc-800/50 transition-all duration-500 group-hover:border-zinc-700/50">
        {/* Gradient overlay on hover */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        
        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            {/* Left content */}
            <div className="flex-1">
              {/* Number and category */}
              <div className="flex items-center gap-4 mb-4">
                <motion.span 
                  className={`text-6xl md:text-8xl font-black bg-gradient-to-br ${project.gradient} bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity`}
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {String(project.id).padStart(2, '0')}
                </motion.span>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">{project.category}</span>
                  <span className="text-xs text-zinc-600 font-mono">{project.year}</span>
                </div>
              </div>
              
              {/* Title */}
              <motion.h3 
                className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4"
                animate={{ x: isHovered ? 10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {project.title}
              </motion.h3>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                      isHovered 
                        ? 'border-zinc-600 text-zinc-300 bg-black/60' 
                        : 'border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
            
            {/* Right - CTA */}
            <MagneticWrapper strength={0.3}>
              <motion.div
                animate={{ 
                  rotate: isHovered ? 45 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`w-14 h-14 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  isHovered 
                    ? `bg-gradient-to-br ${project.gradient} border-transparent` 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <motion.span 
                  className="text-lg"
                  animate={{ color: isHovered ? '#000' : '#fff' }}
                >
                  ↗
                </motion.span>
              </motion.div>
            </MagneticWrapper>
          </div>

          {/* Bottom bar - visible on hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-zinc-800/50 overflow-hidden lg:hidden"
          >
            <p className="text-sm text-zinc-400 leading-relaxed">{project.description}</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const Work = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section 
      ref={containerRef}
      id="work"
      className="py-32 md:py-48 relative overflow-hidden "
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

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="mb-16 md:mb-24"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1.5 bg-[#5852cb]/10 border border-[#5852cb]/20 rounded-full text-[#5852cb] text-xs font-mono">02</span>
            <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-[#5852cb]/40 to-transparent" />
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black">
              <span className="text-white">Selected</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5852cb] via-violet-400 to-indigo-400">Work</span>
            </h2>
            <p className="text-zinc-400 max-w-md text-lg">
              A curated collection of projects that showcase my expertise in building digital products.
            </p>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="space-y-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* View All Link */}
        <motion.div 
          className="mt-16 flex justify-center"
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
                View All Projects
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </a>
          </MagneticWrapper>
        </motion.div>
      </div>
    </section>
  );
};
