import React from 'react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  items: (string | { name: string })[];
  displayAs?: 'pills' | 'list';
}

// Color palette for skill pills
const pillColorClasses = [
    { light: 'bg-violet-100 border-violet-200 text-violet-700', dark: 'dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300'},
    { light: 'bg-sky-100 border-sky-200 text-sky-700', dark: 'dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300'},
    { light: 'bg-green-100 border-green-200 text-green-700', dark: 'dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-300'},
    { light: 'bg-pink-100 border-pink-200 text-pink-700', dark: 'dark:bg-pink-500/10 dark:border-pink-500/20 dark:text-pink-400'}
];

const listContainerVariants = {
  visible: {
    transition: { staggerChildren: 0.05 }
  },
  hidden: {}
};

const listItemVariants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 10 }
};

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, title, items, displayAs = 'pills' }) => {
  return (
    <div 
      className="bg-transparent border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 h-full shadow-glow"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-800 dark:text-light-text">{title}</h2>
      </div>
      <motion.div 
        className={displayAs === 'pills' ? "flex flex-wrap gap-3" : "space-y-3"}
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, index) => {
          const displayText = typeof item === 'string' ? item : item?.name;

          if (!displayText) {
            return null;
          }
          
          if (displayAs === 'list') {
            return (
              <motion.div key={index} className="flex items-start gap-3" variants={listItemVariants}>
                <div className="w-1.5 h-1.5 mt-2 bg-violet-400 rounded-full shrink-0"></div>
                <p className="text-gray-600 dark:text-subtle-text">{displayText}</p>
              </motion.div>
            );
          }
          
          const color = pillColorClasses[index % pillColorClasses.length];
          const colorClass = `${color.light} ${color.dark}`;
          return (
            <motion.div key={index} className={`text-sm font-medium px-3 py-1.5 rounded-full border ${colorClass}`} variants={listItemVariants}>
              <span>{displayText}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default SummaryCard;