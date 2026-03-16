'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { MagneticWrapper } from './animations';

const socials = [
  { name: 'GitHub', href: '#', icon: '🔗' },
  { name: 'LinkedIn', href: '#', icon: '💼' },
  { name: 'Twitter', href: '#', icon: '🐦' },
  { name: 'Dribbble', href: '#', icon: '🏀' },
];

// Large floating CTA button
const FloatingCTA = ({ children, href, color }: { children: React.ReactNode; href: string; color: string }) => (
  <MagneticWrapper strength={0.4}>
    <motion.a
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative group inline-flex items-center justify-center px-12 py-6 rounded-full overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-90 group-hover:opacity-100 transition-opacity`} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-white/10" />
      </div>
      <span className="relative z-10 text-white font-bold text-lg tracking-wide">{children}</span>
    </motion.a>
  </MagneticWrapper>
);

export const Contact = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [emailHovered, setEmailHovered] = useState(false);
  const [time, setTime] = useState('');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const indiaTime = now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setTime(indiaTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      ref={containerRef}
      id="contact"
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
        className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(88, 82, 203, 0.15) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute top-[40%] left-[40%] w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)', filter: 'blur(70px)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center min-h-[60vh]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs text-zinc-600 tracking-[0.3em] uppercase block mb-6">/ Get in touch</span>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Let's work together
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Have a project in mind? I'm always open to discussing new opportunities and ideas.
          </p>
          
          <div 
            onMouseEnter={() => setEmailHovered(true)}
            onMouseLeave={() => setEmailHovered(false)}
            className="inline-block"
          >
            <FloatingCTA href="mailto:hello@example.com" color="from-[#5852cb] to-indigo-600">
              <span className="flex items-center gap-3">
                hello@example.com
                <motion.span 
                  animate={{ x: emailHovered ? 5 : 0 }} 
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  →
                </motion.span>
              </span>
            </FloatingCTA>
          </div>

          {/* Social Links - Main */}
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {socials.map((social) => (
              <MagneticWrapper key={social.name} strength={0.2}>
                <a 
                  href={social.href}
                  className="px-6 py-3 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2 group"
                >
                  <span className="text-lg">{social.icon}</span>
                  <span className="text-zinc-400 group-hover:text-white transition-colors text-sm font-medium">{social.name}</span>
                </a>
              </MagneticWrapper>
            ))}
          </div>
        </motion.div>

        {/* Footer info grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-center border-t border-zinc-800/50 pt-12"
        >
          {/* Time */}
          <div className="text-center md:text-left">
            <span className="text-xs text-zinc-600 uppercase tracking-widest mb-2 block">Local Time</span>
            <div className="text-zinc-300 font-mono">{time} IST</div>
          </div>

          {/* Status */}
          <div className="text-center">
            <span className="text-xs text-zinc-600 uppercase tracking-widest mb-2 block">Status</span>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Available for new projects</span>
            </div>
          </div>

          {/* Socials */}
          <div className="text-center md:text-right">
            <span className="text-xs text-zinc-600 uppercase tracking-widest mb-3 block">Connect</span>
            <div className="flex items-center justify-center md:justify-end gap-3">
              {socials.map((social) => (
                <MagneticWrapper key={social.name} strength={0.3}>
                  <motion.a
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-full  border border-zinc-800 flex items-center justify-center hover:border-[#5852cb]/50 transition-all group"
                    title={social.name}
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">{social.icon}</span>
                  </motion.a>
                </MagneticWrapper>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
