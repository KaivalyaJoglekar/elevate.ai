import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';

import { useResumeContext } from '../hooks/useResumeContext';
import type { CareerPath } from '../types';

import AnimatedPage from '../components/AnimatedPage';
import AtsScoreCard from '../components/ATSMeter';
import SummaryCard from '../components/SummaryCard';
import DeepDiveSection from '../components/DeepDiveSection';
import TipsPanel from '../components/TipsPanel';
import CompatibilityChart from '../components/BarGraph';
import { AppLogo } from '../components/AppLogo';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { 
    AcademicCapIcon, 
    BriefcaseIcon, 
    PencilSquareIcon, 
    PuzzlePieceIcon, 
    ChevronDownIcon,
    ArrowLeftIcon
} from '../components/icons';


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2, // Delay after page transition
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  },
};


const Analysis: React.FC = () => {
  const { analysis, setAnalysis, setFileName, setFile } = useResumeContext();
  const navigate = useNavigate();

  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);

  const validCareerPaths = (analysis?.careerPaths || []).filter(p => {
    if (!p) return false;
    const hasText = p.role && p.description;
    const hasRelevant = p.relevantSkills && p.relevantSkills.length > 0;
    const hasToDevelop = p.skillsToDevelop && p.skillsToDevelop.length > 0;
    return hasText || hasRelevant || hasToDevelop;
  });

  useEffect(() => {
    if (validCareerPaths.length > 0) {
      const sortedPaths = [...validCareerPaths].sort((a, b) => b.matchPercentage - a.matchPercentage);
      setSelectedPath(sortedPaths[0]);
    } else {
      setSelectedPath(null);
    }
  }, [analysis]);

  const handleReset = () => {
    setAnalysis(null);
    setFileName(null);
    setFile(null);
    navigate('/');
  }

  if (!analysis) {
    return <Navigate to="/" replace />;
  }
  
  const resumeImprovements = analysis.generalResumeImprovements;
  const hasValidAnalysis = validCareerPaths.length > 0;

  return (
    <AnimatedPage>
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
            <button
                onClick={handleReset}
                className="w-10 h-10 bg-white dark:bg-dark-card border border-gray-200 dark:border-neutral-800 rounded-full flex items-center justify-center text-gray-600 dark:text-subtle-text hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                aria-label="New Analysis"
            >
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <AppLogo />
        </div>
        <ThemeToggleButton />
      </header>
      
      <motion.main 
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
            <h1 className="text-3xl md:text-4xl font-bold font-sans tracking-tight bg-gradient-to-br from-sky-500 to-violet-500 bg-clip-text text-transparent">Analysis for {analysis.name}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-subtle-text max-w-3xl mx-auto">{analysis.summary || "Here's your personalized career forecast."}</p>
        </motion.div>

        {hasValidAnalysis ? (
          <>
            {/* Key Metrics Section */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={itemVariants}>
              {analysis.atsScore && (
                <div className="md:col-span-1">
                   <AtsScoreCard score={analysis.atsScore.score} feedback={analysis.atsScore.feedback} />
                </div>
              )}

              {analysis.extractedSkills && analysis.extractedSkills.length > 0 && (
                 <div className="md:col-span-2">
                   <SummaryCard 
                       icon={<PuzzlePieceIcon className="w-6 h-6 text-violet-500 dark:text-violet-400" />}
                       title="Key Skills"
                       items={analysis.extractedSkills}
                       displayAs="pills"
                   />
                 </div>
               )}
            </motion.div>

            {/* Experience and Education Section */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={itemVariants}>
              {analysis.experienceSummary && analysis.experienceSummary.length > 0 && (
                  <SummaryCard
                    icon={<BriefcaseIcon className="w-6 h-6 text-violet-500 dark:text-violet-400" />}
                    title="Experience Summary"
                    items={analysis.experienceSummary}
                    displayAs="list"
                  />
              )}
              {analysis.educationSummary && analysis.educationSummary.length > 0 && (
                  <SummaryCard
                    icon={<AcademicCapIcon className="w-6 h-6 text-violet-500 dark:text-violet-400" />}
                    title="Education Summary"
                    items={analysis.educationSummary}
                    displayAs="list"
                  />
              )}
            </motion.div>

            {/* Career Deep Dive Section */}
            <motion.div className="bg-transparent border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-glow p-4 sm:p-8" variants={itemVariants}>
               <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800 dark:text-light-text">Career Deep Dive</h2>

               <div className="w-full mb-8" style={{ height: '400px' }} key={`chart-${selectedPath?.role}`}>
                  <CompatibilityChart paths={validCareerPaths} selectedRole={selectedPath?.role ?? null} />
               </div>

                <div className="relative max-w-lg mx-auto">
                  <select
                    value={selectedPath?.role || ''}
                    onChange={(e) => {
                      const path = validCareerPaths.find(p => p.role === e.target.value);
                      if (path) setSelectedPath(path);
                    }}
                    className="w-full appearance-none bg-snow dark:bg-dark-bg border border-gray-300 dark:border-neutral-700 text-gray-800 dark:text-light-text text-lg py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all duration-300"
                  >
                    {validCareerPaths.map(path => ( <option key={path.role} value={path.role}>{path.role}</option>))}
                  </select>
                  <ChevronDownIcon className="w-6 h-6 text-gray-500 dark:text-subtle-text absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

               <AnimatePresence mode="wait">
                  {selectedPath && <DeepDiveSection key={selectedPath.role} path={selectedPath} />}
               </AnimatePresence>
            </motion.div>

            {/* Actionable Insights Section */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800 dark:text-light-text">Actionable Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TipsPanel
                    title="Resume Improvements"
                    icon={<PencilSquareIcon className="w-8 h-8 text-green-500 dark:text-green-400" />}
                    tips={resumeImprovements}
                    color="green"
                />
                <TipsPanel
                    title="Upskilling Suggestions"
                    icon={<AcademicCapIcon className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    tips={analysis.generalUpskillingSuggestions}
                    color="blue"
                />
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div variants={itemVariants} className="bg-white dark:bg-dark-card border border-amber-300 dark:border-amber-500/30 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-500">Analysis Incomplete</h2>
            <p className="text-gray-600 dark:text-subtle-text mt-2 max-w-2xl mx-auto">
                We're sorry, the AI could not generate specific career path recommendations from the provided resume. This can sometimes happen with unique file formats or very specialized content.
            </p>
            <button
                onClick={handleReset}
                className="mt-6 px-6 py-2 bg-gradient-to-br from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:brightness-110 transition-all"
            >
                Try Another Analysis
            </button>
          </motion.div>
        )}
      </motion.main>
      <footer className="text-center mt-16 text-gray-500 dark:text-subtle-text text-sm">
            made with ❤️ by Kaivalya
      </footer>
    </AnimatedPage>
  );
};

export default Analysis;