'use client';

import { useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ParallaxWrapperProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxWrapper = ({ 
  children, 
  speed = 0.5,
  className = ''
}: ParallaxWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = ref.current;
    if (!element) return;

    gsap.to(element, {
      y: () => speed * 100 * (speed > 0 ? -1 : 1),
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
