import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="h-10 w-10 rounded-xl border border-teal-700/20 bg-white/70 text-brand-purple shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-brand-purple/30 focus:outline-none dark:border-cyan-200/20 dark:bg-dark-card/80 dark:text-brand-blue"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggleButton;