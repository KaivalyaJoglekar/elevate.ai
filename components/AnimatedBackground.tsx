'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating orbs
    const orbs = container.querySelectorAll('.floating-orb');
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        y: `random(-100, 100)`,
        x: `random(-50, 50)`,
        duration: `random(15, 25)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5,
      });

      gsap.to(orb, {
        scale: `random(0.8, 1.2)`,
        opacity: `random(0.3, 0.7)`,
        duration: `random(5, 10)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    // Animate grid lines
    const gridLines = container.querySelectorAll('.grid-line');
    gridLines.forEach((line, i) => {
      gsap.fromTo(line, 
        { opacity: 0, scaleX: 0 },
        {
          opacity: 0.03,
          scaleX: 1,
          duration: 2,
          delay: i * 0.1,
          ease: 'power2.out',
        }
      );
    });

    // Animate geometric shapes
    const shapes = container.querySelectorAll('.geo-shape');
    shapes.forEach((shape, i) => {
      gsap.to(shape, {
        rotation: 360,
        duration: 60 + i * 10,
        repeat: -1,
        ease: 'none',
      });

      gsap.to(shape, {
        y: `random(-200, 200)`,
        x: `random(-100, 100)`,
        duration: 30 + i * 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Orbs */}
      <div 
        className="floating-orb absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="floating-orb absolute top-[50%] right-[5%] w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div 
        className="floating-orb absolute bottom-[10%] left-[30%] w-[700px] h-[700px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Animated Grid */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="grid-line absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"
            style={{ top: `${(i + 1) * 5}%` }}
          />
        ))}
        {[...Array(20)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="grid-line absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent"
            style={{ left: `${(i + 1) * 5}%` }}
          />
        ))}
      </div>

      {/* Geometric Shapes */}
      <div 
        className="geo-shape absolute top-[20%] right-[20%] w-64 h-64 border border-[#ff6b35]/10"
        style={{ transform: 'rotate(45deg)' }}
      />
      <div 
        className="geo-shape absolute bottom-[30%] left-[15%] w-48 h-48 rounded-full border border-[#00d9ff]/10"
      />
      <div 
        className="geo-shape absolute top-[60%] right-[30%] w-32 h-32 border border-white/5"
        style={{ transform: 'rotate(30deg)' }}
      />

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="floating-orb absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};
