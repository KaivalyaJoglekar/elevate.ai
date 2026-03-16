'use client';

import { useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface HorizontalScrollSectionProps {
  children: ReactNode;
  className?: string;
}

export const HorizontalScrollSection = ({ 
  children, 
  className = '' 
}: HorizontalScrollSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const trigger = triggerRef.current;
    const container = containerRef.current;
    
    if (!section || !trigger || !container) return;

    const scrollWidth = container.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = scrollWidth - viewportWidth;

    gsap.to(container, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: trigger,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, { scope: sectionRef, dependencies: [] });

  return (
    <div ref={sectionRef} className={className}>
      <div ref={triggerRef} className="h-screen overflow-hidden">
        <div 
          ref={containerRef} 
          className="flex h-full items-center gap-8 pl-[10vw]"
          style={{ width: 'max-content' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
