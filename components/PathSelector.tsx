import React from 'react';
import { motion } from 'framer-motion';
import type { CareerPath } from '../types';

interface PathSelectorProps {
  paths: CareerPath[];
  selectedPath: CareerPath | null;
  onSelect: (path: CareerPath) => void;
}

const PathSelector: React.FC<PathSelectorProps> = ({ paths, selectedPath, onSelect }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
      {paths.map((path) => (
        <button
          key={path.role}
          onClick={() => onSelect(path)}
          className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
            selectedPath?.role === path.role
              ? 'text-white'
              : 'text-subtle-text hover:text-light-text'
          }`}
        >
          {selectedPath?.role === path.role && (
            <motion.div
              layoutId="selectedPathIndicator"
              className="absolute inset-0 bg-brand-purple rounded-full z-0"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{path.role}</span>
        </button>
      ))}
    </div>
  );
};

export default PathSelector;
