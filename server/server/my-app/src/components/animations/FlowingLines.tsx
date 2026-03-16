'use client';

import { useRef, useEffect } from 'react';

export const FlowingLines = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Animate paths
    const paths = svg.querySelectorAll('path');
    paths.forEach((path, i) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      
      // Animate stroke
      path.animate([
        { strokeDashoffset: length },
        { strokeDashoffset: 0 },
      ], {
        duration: 3000 + i * 500,
        delay: i * 200,
        fill: 'forwards',
        easing: 'ease-out',
      });
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-30">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(6, 182, 212, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Flowing curves */}
        <path
          d="M-100 540 Q 400 200, 960 540 T 2020 540"
          fill="none"
          stroke="url(#lineGradient1)"
          strokeWidth="1"
          className="animate-flow"
        />
        <path
          d="M-100 600 Q 500 300, 960 600 T 2020 600"
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="0.5"
          className="animate-flow"
        />
        <path
          d="M-100 480 Q 300 100, 960 480 T 2020 480"
          fill="none"
          stroke="url(#lineGradient1)"
          strokeWidth="0.5"
          className="animate-flow"
        />
        <path
          d="M-100 660 Q 600 400, 960 660 T 2020 660"
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="1"
          className="animate-flow"
        />
        
        {/* Diagonal lines */}
        <line
          x1="0" y1="1080"
          x2="600" y2="0"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="1"
        />
        <line
          x1="300" y1="1080"
          x2="900" y2="0"
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth="1"
        />
        <line
          x1="1320" y1="1080"
          x2="1920" y2="0"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="1"
        />
        <line
          x1="1620" y1="1080"
          x2="2220" y2="0"
          stroke="rgba(6, 182, 212, 0.08)"
          strokeWidth="1"
        />
      </svg>
      
      <style jsx>{`
        @keyframes flow {
          0% {
            stroke-dashoffset: 2000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animate-flow {
          animation: flow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
