'use client';

import { SmoothScroll, ElevatedGridBackground } from '@/components/animations';
import { 
  Header, 
  Hero, 
  Work, 
  Experience, 
  Contact,
  CustomCursor,
  ScrollProgress,
} from '@/components';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#020202] text-zinc-200 selection:bg-[#5852cb]/30 overflow-hidden">
      {/* Global Animated Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ElevatedGridBackground />
      </div>

      {/* Custom Cursor */}
      <CustomCursor />
      
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Smooth Scroll */}
      <SmoothScroll />

      {/* Page Content */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <Work />
        <Experience />
        <Contact />
      </div>
    </main>
  );
}
