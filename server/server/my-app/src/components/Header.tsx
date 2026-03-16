'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { MagneticWrapper } from './animations';

export const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  // Hide header on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > lastScrollY.current && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    lastScrollY.current = latest;
    setIsScrolled(latest > 50);
  });

  // Track active section
  useEffect(() => {
    // Only run on client
    if (typeof document === 'undefined') return;
    
    // Safety check for elements
    const sections = ['work', 'about', 'experience', 'contact'];
    const elements = sections.map(id => document.getElementById(id)).filter(Boolean) as Element[];
    
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        threshold: 0.2, // Lower threshold for better mobile detection
        rootMargin: '-20% 0px -20% 0px' // Trigger when element is near center
      }
    );
    
    elements.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { name: 'Work', href: '#work' },
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <motion.header 
        ref={headerRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-6"
      >
        <motion.div 
          className={`relative mx-auto max-w-7xl rounded-3xl transition-all duration-500 ${
            isScrolled 
              ? 'bg-black/80 backdrop-blur-3xl border border-white/[0.12] shadow-[0_8px_40px_rgba(88,82,203,0.15)]' 
              : 'bg-black/40 backdrop-blur-xl border border-white/[0.08]'
          }`}
        >
          {/* Enhanced gradient border glow */}
          {isScrolled && (
            <motion.div 
              className="absolute inset-0 rounded-3xl" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(88,82,203,0.15) 0%, rgba(124,58,237,0.1) 50%, rgba(139,92,246,0.15) 100%)',
                pointerEvents: 'none'
              }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
          
          <div className="relative px-8 py-5 flex items-center justify-between">
            {/* Enhanced Logo */}
            <MagneticWrapper strength={0.2}>
              <motion.a 
                href="#" 
                className="group relative flex items-center gap-3"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  {/* Animated gradient background */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5852cb] via-[#7c3aed] to-violet-600 opacity-30 group-hover:opacity-60 transition-opacity"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div 
                    className="absolute inset-0 rounded-2xl border-2 border-[#5852cb]/40 group-hover:border-[#5852cb]/70 transition-colors"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5852cb]/20 to-transparent blur group-hover:blur-lg transition-all" />
                  <span className="relative text-xl font-black bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">K</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-base font-bold text-white tracking-tight">Kaivalya</span>
                  <span className="text-[10px] text-zinc-400 block -mt-0.5 font-medium tracking-wider">Full Stack Dev</span>
                </div>
              </motion.a>
            </MagneticWrapper>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center gap-2 p-1.5 bg-white/[0.04] rounded-2xl border border-white/[0.08] backdrop-blur-xl">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.name.toLowerCase();
                  return (
                    <MagneticWrapper key={link.name} strength={0.12}>
                      <motion.a 
                        href={link.href}
                        className="relative px-5 py-2.5 text-sm transition-colors rounded-xl"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Active pill background with glow */}
                        {isActive && (
                          <>
                            <motion.div 
                              layoutId="navPill"
                              className="absolute inset-0 bg-gradient-to-r from-[#5852cb] to-[#7c3aed] rounded-xl"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                            <motion.div 
                              className="absolute inset-0 bg-[#5852cb]/30 rounded-xl blur-xl"
                              animate={{ opacity: [0.5, 0.8, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </>
                        )}
                        <span className={`relative z-10 font-semibold transition-colors ${
                          isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                        }`}>
                          {link.name}
                        </span>
                      </motion.a>
                    </MagneticWrapper>
                  );
                })}
              </div>
            </nav>

            {/* Enhanced CTA Button */}
            <motion.div className="hidden md:block">
              <MagneticWrapper strength={0.25}>
                <motion.a 
                  href="mailto:hello@kaivalya.dev" 
                  className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5852cb] via-[#7c3aed] to-violet-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-[#5852cb] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-[#5852cb]/40 blur-xl"
                    animate={{ opacity: [0, 0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <span className="relative z-10 text-sm font-bold text-white">Let&apos;s Connect</span>
                  <motion.span 
                    className="relative z-10 text-white"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.a>
              </MagneticWrapper>
            </motion.div>

            {/* Enhanced Mobile Menu Button */}
            <motion.button
              className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <motion.span 
                  className="w-5 h-0.5 bg-white rounded-full origin-center"
                  animate={{ 
                    rotate: isMenuOpen ? 45 : 0, 
                    y: isMenuOpen ? 4 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span 
                  className="w-5 h-0.5 bg-white rounded-full"
                  animate={{ 
                    opacity: isMenuOpen ? 0 : 1,
                    scaleX: isMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span 
                  className="w-5 h-0.5 bg-white rounded-full origin-center"
                  animate={{ 
                    rotate: isMenuOpen ? -45 : 0, 
                    y: isMenuOpen ? -4 : 0 
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.header>

      {/* Mobile Menu - Full Screen */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Enhanced Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/90 backdrop-blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Enhanced Menu Panel */}
            <motion.div
              className="md:hidden fixed inset-6 z-50 bg-gradient-to-br from-black/95 via-[#030305] to-black/95 backdrop-blur-3xl border border-white/[0.12] rounded-[2rem] overflow-hidden shadow-2xl shadow-[#5852cb]/20"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5852cb]/5 via-transparent to-violet-500/5 pointer-events-none" />
              
              {/* Enhanced close button */}
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-xl hover:bg-white/[0.1] transition-colors group"
              >
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Nav Links with enhanced styling */}
              <nav className="flex flex-col justify-center h-full px-12 gap-4">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className="group relative py-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className={`text-5xl font-black transition-all duration-300 bg-gradient-to-r ${
                      activeSection === link.name.toLowerCase() 
                        ? 'from-[#5852cb] via-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent' 
                        : 'text-zinc-600 group-hover:from-white group-hover:to-zinc-400 group-hover:bg-clip-text group-hover:text-transparent'
                    }`}>
                      {link.name}
                    </span>
                    {/* Animated underline */}
                    <motion.div 
                      className="h-1 bg-gradient-to-r from-[#5852cb] to-[#7c3aed] rounded-full mt-2"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
                
                {/* Enhanced CTA in mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                  className="mt-8"
                >
                  <a 
                    href="mailto:hello@kaivalya.dev"
                    className="group relative inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-[#5852cb] via-[#7c3aed] to-violet-500 rounded-2xl text-white font-bold overflow-hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-[#5852cb] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 text-lg">Let&apos;s Connect</span>
                    <motion.span 
                      className="relative z-10"
                      animate={{ x: [0, 5, 0] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </a>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
