import React from 'react';
import { ElevatedGridBackground } from './ElevatedGridBackground';
import { CustomCursor } from './CustomCursor';
import { SmoothScroll } from './SmoothScroll';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-bg-primary text-light-text selection:bg-brand-purple/30 overflow-hidden">
      {/* Global Animated Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ElevatedGridBackground />
      </div>

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Smooth Scroll */}
      <SmoothScroll />

      <div className="relative z-10">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;