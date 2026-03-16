'use client';

import { useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface FadeUpTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export const FadeUpText = ({ 
  children, 
  className = '',
  delay = 0,
  duration = 1,
  once = true,
}: FadeUpTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    gsap.fromTo(text, 
      { 
        y: 60,
        opacity: 0,
        rotate: 3,
        transformOrigin: "left top", // Ensure rotation doesn't cause clipping
      },
      {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration,
        ease: 'power4.out',
        delay,
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        }
      }
    );
  }, { scope: containerRef, dependencies: [once, delay, duration] });

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div ref={textRef} className={`will-change-transform ${className}`}>
        {children}
      </div>
    </div>
  );
};
