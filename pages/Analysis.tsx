import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';

import { useResumeContext } from '../hooks/useResumeContext';
import type { CareerPath, CareerData } from '../types';

import AnimatedPage from '../components/AnimatedPage';
import AtsScoreCard from '../components/ATSMeter';
import SummaryCard from '../components/SummaryCard';
import DeepDiveSection from '../components/DeepDiveSection';
import TipsPanel from '../components/TipsPanel';
import CompatibilityChart from '../components/BarGraph';
import ThemeToggleButton from '../components/ThemeToggleButton';
import {
    AcademicCapIcon,
    BriefcaseIcon,
    PencilSquareIcon,
    PuzzlePieceIcon,
    ChevronDownIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon
} from '../components/icons';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 }},
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 }},
};

type AnalysisView = 'full-time' | 'internship';

const JobCard = ({ job, variants }: { job: CareerPath, variants: Variants }) => {
  return (
    <motion.div
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="bg-white dark:bg-dark-card border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-glow flex flex-col group transition-all duration-300 hover:border-brand-purple"
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 dark:text-light-text group-hover:text-brand-purple transition-colors">{job.role}</h3>
          <span className="flex-shrink-0 ml-4 px-3 py-1 text-sm font-bold bg-brand-purple/10 text-brand-purple rounded-full">
            {job.matchPercentage}%
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-subtle-text mb-4">{job.employer_name}</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Relevant:</span>
          {job.relevantSkills.slice(0, 3).map(skill => (
            <span key={skill.name} className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
              {skill.name}
            </span>
          ))}
        </div>
      </div>
      <a
        href={job.job_link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full text-center mt-6 px-4 py-2 bg-gradient-to-br from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:brightness-110 transform hover:scale-105 transition-all duration-200"
      >
        Apply Now
      </a>
    </motion.div>
  );
};


const Analysis: React.FC = () => {
  const { analysis, setAnalysis, setFileName, setFile } = useResumeContext();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<AnalysisView>('full-time');
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dataToDisplay: CareerData | null = analysis
    ? (currentView === 'full-time' ? analysis.full_time_analysis : analysis.internship_analysis)
    : null;

  const validCareerPaths = (dataToDisplay?.careerPaths || []).filter(p => p?.role && p.matchPercentage);
  const hasValidAnalysis = analysis && analysis.full_time_analysis && analysis.internship_analysis;

  const filteredJobs = validCareerPaths.filter(job =>
    job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (dataToDisplay && dataToDisplay.careerPaths.length > 0) {
      const sortedPaths = [...dataToDisplay.careerPaths].sort((a, b) => b.matchPercentage - a.matchPercentage);
      setSelectedPath(sortedPaths[0]);
    } else {
      setSelectedPath(null);
    }
  }, [dataToDisplay]);

  const handleReset = () => {
    setAnalysis(null);
    setFileName(null);
    setFile(null);
    navigate('/');
  };

  if (!analysis) {
    return <Navigate to="/" replace />;
  }

  return (
    <AnimatedPage>
      <header className="flex justify-between items-center mb-10">
        <div className="flex">
            <button
                onClick={handleReset}
                className="w-10 h-10 bg-white dark:bg-dark-card border border-gray-200 dark:border-neutral-800 rounded-full flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF2D55]"
            >
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="flex items-center gap-4">
          <a onClick={handleReset} className="cursor-pointer px-5 py-2 bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white font-semibold rounded-lg hover:brightness-110 transform transition-transform hover:scale-105">
            New Analysis
          </a>
          <ThemeToggleButton />
        </div>
      </header>

      <motion.main key={currentView} className="space-y-16" variants={containerVariants} initial="hidden" animate="visible">

        <div className="flex items-center justify-center p-1 space-x-1 bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-neutral-800 rounded-lg max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('full-time')}
            className={`w-full px-6 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${currentView === 'full-time' ? 'bg-white shadow dark:bg-neutral-700 text-gray-800 dark:text-white' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-white'}`}
          >
            Full-Time Analysis
          </button>
          <button
            onClick={() => setCurrentView('internship')}
            className={`w-full px-6 py-2 text-sm font-semibold rounded-md transition-colors duration-300 ${currentView === 'internship' ? 'bg-white shadow dark:bg-neutral-700 text-gray-800 dark:text-white' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-white'}`}
          >
            Internship Analysis
          </button>
        </div>

        {hasValidAnalysis && dataToDisplay ? (
          <>
            <motion.div className="text-center" variants={itemVariants}>
              <h1 className="text-3xl md:text-4xl font-bold font-sans tracking-tight text-gray-900 dark:text-white">{dataToDisplay.name}</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto">{dataToDisplay.summary}</p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={itemVariants}>
              <AtsScoreCard score={dataToDisplay.atsScore.score} feedback={dataToDisplay.atsScore.feedback} />
              <div className="md:col-span-2">
                <SummaryCard icon={<PuzzlePieceIcon className="w-6 h-6 text-violet-500" />} title="Key Skills" items={dataToDisplay.extractedSkills} displayAs="pills" />
              </div>
            </motion.div>

            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={itemVariants}>
              {dataToDisplay.experienceSummary && dataToDisplay.experienceSummary.length > 0 && <SummaryCard icon={<BriefcaseIcon className="w-6 h-6 text-violet-500" />} title="Experience Summary" items={dataToDisplay.experienceSummary} displayAs="list" />}
              {dataToDisplay.educationSummary && dataToDisplay.educationSummary.length > 0 && <SummaryCard icon={<AcademicCapIcon className="w-6 h-6 text-violet-500" />} title="Education Summary" items={dataToDisplay.educationSummary} displayAs="list" />}
            </motion.div>

            {validCareerPaths.length > 0 ? (
              <motion.div className="p-4 sm:p-8" variants={itemVariants}>
                 <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Career Path Deep Dive</h2>
                 <div className="w-full mb-8" style={{ height: '500px' }}>
                    <CompatibilityChart paths={validCareerPaths} selectedRole={selectedPath?.role ?? null} />
                 </div>
                  <div className="relative max-w-lg mx-auto">
                    <select
                      value={selectedPath?.role || ''}
                      onChange={(e) => { const path = validCareerPaths.find(p => p.role === e.target.value); if (path) setSelectedPath(path); }}
                      className="w-full appearance-none bg-white dark:bg-dark-card border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white text-lg py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D55] transition-all"
                    >
                      {validCareerPaths.map(path => ( <option key={`${path.role}-${path.employer_name}`} value={path.role}>{path.role}</option>))}
                    </select>
                    <ChevronDownIcon className="w-6 h-6 text-gray-400 dark:text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                  </div>
                 <AnimatePresence mode="wait">
                    {selectedPath && <DeepDiveSection key={`${selectedPath.role}-${selectedPath.employer_name}`} path={selectedPath} />}
                 </AnimatePresence>
              </motion.div>
            ) : null }

            <motion.div variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Actionable Insights</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <TipsPanel title="Resume Improvements" icon={<PencilSquareIcon className="w-8 h-6 text-green-400" />} tips={dataToDisplay.generalResumeImprovements} color="green" />
                    <TipsPanel title="Upskilling Suggestions" icon={<AcademicCapIcon className="w-8 h-8 text-sky-400" />} tips={dataToDisplay.generalUpskillingSuggestions} color="blue" />
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center md:text-left">
                  Recommended Opportunities
                </h2>
                <div className="relative w-full max-w-xs">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white dark:bg-dark-card border border-gray-300 dark:border-neutral-800 text-gray-900 dark:text-white rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-[#FF2D55] focus:outline-none transition"
                    />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredJobs.map((job) => (
                    <JobCard key={`${job.role}-${job.employer_name}`} job={job} variants={itemVariants} />
                  ))}
                </AnimatePresence>
              </div>
              {filteredJobs.length === 0 && (
                <p className="text-center text-gray-500 dark:text-neutral-500 mt-8">No job listings match your search criteria.</p>
              )}
            </motion.div>
          </>
        ) : (
          <motion.div variants={itemVariants} className="bg-amber-50 dark:bg-[#1C1C1E] border border-amber-300 dark:border-amber-500/30 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-500">Analysis Incomplete</h2>
            <p className="text-amber-800 dark:text-neutral-400 mt-2 max-w-2xl mx-auto">We're sorry, our AI could not generate a complete analysis from the provided resume.</p>
            <a onClick={handleReset} className="cursor-pointer inline-block mt-6 px-6 py-2 bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white font-semibold rounded-lg hover:brightness-110">
                Try Another Analysis
            </a>
          </motion.div>
        )}
      </motion.main>
      <footer className="text-center mt-16 text-gray-500 dark:text-neutral-500 text-sm">
            made with ❤️ by Kaivalya Joglekar
      </footer>
    </AnimatedPage>
  );
};

export default Analysis;