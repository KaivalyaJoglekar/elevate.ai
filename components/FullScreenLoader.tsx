import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: number;
  label: string;
  sublabel: string;
}

const STEPS: Step[] = [
  { id: 0, label: 'Reading document', sublabel: 'Extracting clean text and structure' },
  { id: 1, label: 'Running AI analysis', sublabel: 'Deep-reading experience and skills' },
  { id: 2, label: 'Evaluating compatibility', sublabel: 'Benchmarking against industry standards' },
  { id: 3, label: 'Finalizing report', sublabel: 'Structuring career insights' },
];

interface FullScreenLoaderProps {
  isVisible: boolean;
  activeStep?: number;
}

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
    <motion.path
      d="M4 10l4 4 8-7"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.3 }}
    />
  </svg>
);

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isVisible, activeStep = 0 }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/5 bg-black/75 p-10 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-primary mb-8 text-center">
              Processing Intelligence
            </p>

            <ol className="space-y-6">
              {STEPS.map((step, i) => {
                const isDone = i < activeStep;
                const isActive = i === activeStep;
                const isPending = i > activeStep;

                return (
                  <motion.li
                    key={step.id}
                    layout
                    className="flex items-start gap-5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300
                      ${isDone ? 'border-accent-primary bg-accent-primary text-white' : ''}
                      ${isActive ? 'border-accent-primary border-t-transparent animate-spin' : ''}
                      ${isPending ? 'border-white/10 bg-black/40' : ''}
                    `}>
                      {isDone && <CheckIcon />}
                    </div>

                    <div className="min-w-0">
                      <p className={`text-sm font-medium transition-colors duration-300
                        ${isActive ? 'text-light-text' : ''}
                        ${isDone ? 'text-accent-primary' : ''}
                        ${isPending ? 'text-subtle-text' : ''}
                      `}>
                        {step.label}
                      </p>
                      
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            key="sublabel"
                            className="mt-1 text-xs text-subtle-text"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {step.sublabel}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
            
            <div className="mt-10 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center text-xs font-semibold text-subtle-text mb-2 tracking-wider">
                <span>PROGRESS</span>
                <span>{Math.round(((activeStep + 1) / STEPS.length) * 100)}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-accent-primary"
                  animate={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenLoader;