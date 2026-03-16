'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const MouseGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Main glow follows mouse
      gsap.to(glow, {
        x: mouseX,
        y: mouseY,
        duration: 1.5,
        ease: 'power3.out',
      });

      // Trail effect
      trailsRef.current.forEach((trail, i) => {
        if (trail) {
          gsap.to(trail, {
            x: mouseX,
            y: mouseY,
            duration: 2 + i * 0.3,
            ease: 'power2.out',
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Trail glows */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailsRef.current[i] = el; }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 400 + i * 100,
            height: 400 + i * 100,
            left: 0,
            top: 0,
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(6, 182, 212, 0.02) 0%, transparent 70%)',
            filter: `blur(${40 + i * 20}px)`,
          }}
        />
      ))}
      
      {/* Main glow */}
      <div
        ref={glowRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          left: 0,
          top: 0,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
};
