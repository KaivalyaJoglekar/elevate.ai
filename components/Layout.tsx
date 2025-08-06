// src/components/Layout.tsx

import React from 'react';
import { motion } from 'framer-motion';

const Blob = ({ className, animationProps, style }: { className: string, animationProps: any, style: React.CSSProperties }) => (
    <motion.div 
        style={style}
        className={`absolute rounded-full filter blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none hidden md:block ${className}`}
        animate={animationProps.animate}
        transition={animationProps.transition}
    />
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const blobs = [
    { class: 'w-[25rem] h-[25rem] bg-red-500/20 dark:bg-red-500/15', animate: { x: [0, 20, -40, 0], y: [0, 30, -10, 0] }, transition: { duration: 40, repeat: Infinity, repeatType: 'mirror' } },
    { class: 'w-[30rem] h-[30rem] bg-pink-500/15 dark:bg-pink-500/10', animate: { x: [0, -30, 20, 0], y: [0, 50, -30, 0] }, transition: { duration: 45, repeat: Infinity, repeatType: 'mirror' } },
  ];
  
  const blobPositions: React.CSSProperties[] = [
    { top: '-5rem', left: '-15rem' },
    { bottom: '-10rem', right: '-15rem' },
  ];

  return (
    <div className="min-h-screen bg-snow dark:bg-dark-bg text-gray-800 dark:text-light-text font-sans relative overflow-x-hidden transition-colors duration-300">
        <div 
          className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none" 
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}
        ></div>
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