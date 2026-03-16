// components/SummaryCard.tsx

import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  items: (string | { name: string })[];
  displayAs?: 'pills' | 'list';
}

const pillPalette = [
  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary',
  'bg-accent-primary/10 border-accent-primary/20 text-accent-primary',
  'bg-orange-500/10 border-orange-500/20 text-orange-400',
  'bg-pink-500/10 border-pink-500/20 text-pink-400',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const childVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 18 } },
};

const SummaryCard: React.FC<SummaryCardProps> = memo(({ icon, title, items, displayAs = 'pills' }) => {
  return (
    <motion.div
      className="bg-black/45 rounded-2xl border border-white/[0.08] relative h-full overflow-hidden p-8 transition-all duration-300 hover:border-accent-secondary/30"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-2.5 shadow-sm">
            {icon}
          </div>
          <h2 className="font-display text-xl font-bold text-light-text">{title}</h2>
        </div>

        <motion.div
          className={displayAs === 'pills' ? 'flex flex-wrap gap-2.5' : 'space-y-4'}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {items.map((item, index) => {
            const text = typeof item === 'string' ? item : item?.name;
            if (!text) return null;

            if (displayAs === 'list') {
              return (
                <motion.div key={index} variants={childVariants} className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-black/25">
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent-primary" />
                  <p className="text-[15px] leading-relaxed text-light-text font-medium">{text}</p>
                </motion.div>
              );
            }

            const cls = pillPalette[index % pillPalette.length];
            return (
              <motion.div
                key={index}
                variants={childVariants}
                className={`text-[11px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-full border backdrop-blur-sm ${cls}`}
              >
                {text}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
});

export default SummaryCard;