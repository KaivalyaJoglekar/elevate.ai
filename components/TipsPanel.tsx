// src/components/TipsPanel.tsx

import React, { memo } from 'react';
import { CheckCircleIcon } from './icons';

interface TipsPanelProps {
  title: string;
  icon: React.ReactNode;
  tips: string[];
  color: 'green' | 'blue';
}

const TipsPanel: React.FC<TipsPanelProps> = memo(({ title, icon, tips, color }) => {

  const itemColorClasses = {
    green: 'text-green-500 dark:text-green-400',
    blue: 'text-sky-500 dark:text-sky-400',
  }

  return (
    // ✅ FIXED: Added bg-white/50 for light theme and border-brand-purple/50 for the glowing border effect.
    <div className="bg-white/50 dark:bg-transparent border border-brand-purple/50 dark:border-neutral-800 rounded-2xl p-6 h-full shadow-glow">
        <div className="flex items-center gap-4 mb-4">
          {icon}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-light-text">{title}</h2>
        </div>
        <ul 
          className="space-y-4"
        >
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircleIcon className={`flex-shrink-0 w-6 h-6 mt-1 ${itemColorClasses[color]}`} />
              <span className="text-gray-600 dark:text-subtle-text">{tip}</span>
            </li>
          ))}
        </ul>
    </div>
  );
});

export default TipsPanel;