'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    const glow = glowRef.current;
    
    if (!cursor || !cursorDot || !glow) return;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Instant dot position
      gsap.to(cursorDot, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: 'power2.out',
      });

      // Smooth cursor ring follow
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.5,
        ease: 'power3.out',
      });

      // Smooth glow follow
      gsap.to(glow, {
        x: mouseX,
        y: mouseY,
        duration: 0.8,
        ease: 'power2.out',
      });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('a, button, [data-magnetic], [data-cursor-expand]')) {
        setIsHovering(true);
        
        const text = target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text');
        if (text) setCursorText(text);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('a, button, [data-magnetic], [data-cursor-expand]')) {
        setIsHovering(false);
        setCursorText('');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (isHovering) {
      gsap.to(cursor, {
        scale: 2.5,
        duration: 0.4,
        ease: 'power3.out',
      });
    } else {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  }, [isHovering]);

  return (
    <>
      {/* Spotlight glow */}
      <div 
        ref={glowRef}
        className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
          left: 0,
          top: 0,
        }}
      />
      
      {/* Cursor ring */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{ left: 0, top: 0 }}
      >
        <div className={`
          w-10 h-10 rounded-full border border-white/80
          flex items-center justify-center
          transition-all duration-300
          ${isHovering ? 'bg-white/10' : 'bg-transparent'}
        `}>
          {cursorText && (
            <span className="text-[8px] font-bold uppercase tracking-wider text-white">
              {cursorText}
            </span>
          )}
        </div>
      </div>

      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className="fixed pointer-events-none z-[10001] -translate-x-1/2 -translate-y-1/2"
        style={{ left: 0, top: 0 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    </>
  );
};
