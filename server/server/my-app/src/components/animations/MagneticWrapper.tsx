'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import gsap from 'gsap';

interface MagneticWrapperProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticWrapper = ({ 
  children, 
  strength = 0.5, 
  className = '' 
}: MagneticWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const trigger = ref.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    // Increase hit area for better magnetic feel
    const handleMouseMove = (e: MouseEvent) => {
      const rect = trigger.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + 
        Math.pow(e.clientY - centerY, 2)
      );

      // Only activate magnetic effect if within reasonable range (e.g. 100px)
      // This prevents "sticking" when moving fast across
      if (distance > 200) {
        gsap.to(content, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        return;
      }

      // Calculate distance from center of the static trigger element
      const x = (e.clientX - centerX) * strength;
      const y = (e.clientY - centerY) * strength;

      gsap.to(content, {
        x: x,
        y: y,
        duration: 0.4,
        ease: 'power3.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(content, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
      });
      setIsHovered(false);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    trigger.addEventListener('mousemove', handleMouseMove);
    trigger.addEventListener('mouseleave', handleMouseLeave);
    trigger.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      trigger.removeEventListener('mousemove', handleMouseMove);
      trigger.removeEventListener('mouseleave', handleMouseLeave);
      trigger.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [strength]);

  return (
    <div 
      ref={ref} 
      className={`inline-block ${className}`}
      data-magnetic="true"
      data-hovered={isHovered}
    >
      <div ref={contentRef} className="inline-block">
        {children}
      </div>
    </div>
  );
};
