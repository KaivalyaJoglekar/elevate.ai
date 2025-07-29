import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from './icons';

interface TipsPanelProps {
  title: string;
  icon: React.ReactNode;
  tips: string[];
  color: 'green' | 'blue';
}

const TipsPanel: React.FC<TipsPanelProps> = ({ title, icon, tips, color }) => {

  const itemColorClasses = {
    green: 'text-green-500 dark:text-green-400',
    blue: 'text-sky-500 dark:text-sky-400',
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="bg-transparent border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 h-full shadow-glow">
        <div className="flex items-center gap-4 mb-4">
          {icon}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-light-text">{title}</h2>
        </div>
        <motion.ul 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tips.map((tip, index) => (
            <motion.li key={index} className="flex items-start gap-3" variants={itemVariants}>
              <CheckCircleIcon className={`flex-shrink-0 w-6 h-6 mt-1 ${itemColorClasses[color]}`} />
              <span className="text-gray-600 dark:text-subtle-text">{tip}</span>
            </motion.li>
          ))}
        </motion.ul>
    </div>
  );
};

export default TipsPanel;