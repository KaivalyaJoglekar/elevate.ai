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
    green: 'text-emerald-400',
    blue: 'text-accent-secondary',
  };

  return (
    <div className="bg-black/45 rounded-2xl border border-white/[0.08] h-full p-8 transition-all duration-300 hover:border-accent-secondary/30">
      <div className="flex items-center gap-4 mb-6">
        <div className="rounded-xl border border-white/[0.06] p-2.5 bg-black/30 shadow-sm">
          {icon}
        </div>
        <h2 className="font-display text-xl font-bold text-light-text">{title}</h2>
      </div>
      <ul className="space-y-4">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-black/25 transition-colors hover:border-accent-secondary/25 hover:bg-black/35">
            <CheckCircleIcon className={`flex-shrink-0 w-5 h-5 mt-0.5 ${itemColorClasses[color]}`} />
            <span className="text-[15px] leading-relaxed text-light-text font-medium">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TipsPanel;