'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const AuroraBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate aurora blobs
    blobsRef.current.forEach((blob, i) => {
      if (!blob) return;
      
      gsap.to(blob, {
        x: 'random(-100, 100)',
        y: 'random(-100, 100)',
        scale: 'random(0.8, 1.3)',
        duration: 'random(15, 25)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 2,
      });

      gsap.to(blob, {
        opacity: 'random(0.15, 0.35)',
        duration: 'random(4, 8)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  }, []);

  const addBlobRef = (el: HTMLDivElement | null, index: number) => {
    if (el) blobsRef.current[index] = el;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Main aurora blobs */}
      <div 
        ref={(el) => addBlobRef(el, 0)}
        className="absolute top-0 left-[10%] w-[50vw] h-[50vh] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      <div 
        ref={(el) => addBlobRef(el, 1)}
        className="absolute top-[20%] right-[5%] w-[60vw] h-[60vh] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 217, 255, 0.4) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      
      <div 
        ref={(el) => addBlobRef(el, 2)}
        className="absolute bottom-[10%] left-[20%] w-[45vw] h-[45vh] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />
      
      <div 
        ref={(el) => addBlobRef(el, 3)}
        className="absolute top-[60%] right-[15%] w-[40vw] h-[40vh] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      <div 
        ref={(el) => addBlobRef(el, 4)}
        className="absolute top-[40%] left-[40%] w-[30vw] h-[30vh] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Animated grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 107, 53, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 53, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float-gentle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#ff6b35', '#00d9ff', '#a855f7', '#fbbf24', '#10b981'][i % 5],
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Subtle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5, 5, 5, 0.6) 100%)',
        }}
      />
    </div>
  );
};
