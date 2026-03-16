'use client';

import { useEffect, useRef } from 'react';

export const ModernBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Subtle gradient orbs
    const orbs = [
      { x: 0.2, y: 0.3, radius: 0.4, color: 'rgba(139, 92, 246, 0.03)', speed: 0.0002 },
      { x: 0.8, y: 0.7, radius: 0.35, color: 'rgba(6, 182, 212, 0.03)', speed: 0.00015 },
      { x: 0.5, y: 0.5, radius: 0.3, color: 'rgba(139, 92, 246, 0.02)', speed: 0.00025 },
    ];

    const animate = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        const x = (orb.x + Math.sin(time * orb.speed * 1000) * 0.1) * canvas.width;
        const y = (orb.y + Math.cos(time * orb.speed * 800) * 0.1) * canvas.height;
        const radius = orb.radius * Math.min(canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full -z-10"
      />
      {/* Subtle noise texture */}
      <div 
        className="fixed inset-0 -z-10 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Grid pattern */}
      <div 
        className="fixed inset-0 -z-10 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
    </>
  );
};
