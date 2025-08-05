import React from 'react';
import { motion } from 'framer-motion';

// ✅ FIXED: Added the missing interface definition for the component's props.
interface LayoutProps {
  children: React.ReactNode;
}

// The Blob component is defined locally for use in this layout.
const Blob = ({ className, animationProps, style }: { className: string, animationProps: any, style: React.CSSProperties }) => (
    <motion.div 
        style={style}
        className={`absolute rounded-full filter blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none ${className}`}
        animate={animationProps.animate}
        transition={animationProps.transition}
    />
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // RESTORED: The animated blobs are back as requested for visual effect.
  const blobs = [
    { class: 'w-[30rem] h-[30rem] bg-red-500 opacity-25 dark:opacity-15', animate: { x: [0, 50, -20, 0], y: [0, -30, 60, 0] }, transition: { duration: 40, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } },
    { class: 'w-[35rem] h-[35rem] bg-brand-blue opacity-20 dark:opacity-10', animate: { x: [0, -40, 30, 0], y: [0, 60, -40, 0] }, transition: { duration: 50, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } },
    { class: 'w-[25rem] h-[25rem] bg-brand-purple opacity-25 dark:opacity-15', animate: { x: [0, 30, -60, 0], y: [0, 40, -20, 0] }, transition: { duration: 45, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } },
    { class: 'w-[30rem] h-[30rem] bg-sky-400 opacity-25 dark:opacity-15', animate: { x: [0, -50, 20, 0], y: [0, 30, -60, 0] }, transition: { duration: 42, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } },
    { class: 'w-[35rem] h-[35rem] bg-pink-500 opacity-20 dark:opacity-10', animate: { x: [0, 40, -30, 0], y: [0, -60, 40, 0] }, transition: { duration: 52, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } },
    { class: 'w-[25rem] h-[25rem] bg-violet-500 opacity-25 dark:opacity-15', animate: { x: [0, -30, 60, 0], y: [0, -40, 20, 0] }, transition: { duration: 48, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } },
  ];
  
  const blobPositions: React.CSSProperties[] = [
    { top: '-10rem', left: '-20rem' },
    { top: '50%', left: '-25rem', transform: 'translateY(-50%)' },
    { bottom: '-15rem', left: '-15rem' },
    { top: '-12rem', right: '-22rem' },
    { top: '50%', right: '-28rem', transform: 'translateY(-50%)' },
    { bottom: '-18rem', right: '-12rem' },
  ];

  return (
    <div className="min-h-screen bg-snow dark:bg-dark-bg text-gray-800 dark:text-light-text font-sans relative overflow-hidden transition-colors duration-300">
        {/* REMOVED: SplashCursor is gone for good to ensure high performance. */}
        
        {/* A static, low-resource noise texture remains for styling. */}
        <div 
          className="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
          }}
        ></div>

        {/* The animated blobs are rendered here. */}
        {blobs.map((blob, index) => (
            <Blob 
                key={index}
                className={blob.class}
                animationProps={{ animate: blob.animate, transition: blob.transition }}
                style={blobPositions[index]}
            />
        ))}

        <div className="relative z-10">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    </div>
  );
};

export default Layout;