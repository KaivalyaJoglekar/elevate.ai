// pages/Analysis.tsx

import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

import { useResumeContext } from '../hooks/useResumeContext';
import { fetchJobsByQuery } from '../services/backendService';
import type { CareerPath, CareerData } from '../types';

// Import the FullScreenLoader for search feedback
import FullScreenLoader from '../components/FullScreenLoader';
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
      className="bg-white dark:bg-black/30 dark:backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-glow flex flex-col group transition-all duration-300 hover:border-brand-purple"
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 dark:text-light-text group-hover:text-brand-purple transition-colors">{job.role}</h3>
          {job.matchPercentage > 0 && (
            <span className="flex-shrink-0 ml-4 px-3 py-1 text-sm font-bold bg-brand-purple/10 text-brand-purple rounded-full">
              {job.matchPercentage}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-subtle-text mb-4">{job.employer_name}</p>
        <div className="flex flex-wrap gap-2">
          {job.relevantSkills && job.relevantSkills.length > 0 && (
            <>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Relevant:</span>
              {job.relevantSkills.slice(0, 3).map(skill => (
                <span key={skill.name} className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  {skill.name}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
      
      {job.job_link && (
        <a
          href={job.job_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center mt-6 px-4 py-2 bg-gradient-to-br from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:brightness-110 transform hover:scale-105 transition-all duration-200"
        >
          Apply Now
        </a>
      )}
    </motion.div>
  );
};


const Analysis: React.FC = () => {
  const { analysis, setAnalysis, setFileName, setFile } = useResumeContext();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<AnalysisView>('full-time');
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedJobs, setDisplayedJobs] = useState<CareerPath[]>([]);
  const [chartPaths, setChartPaths] = useState<CareerPath[]>([]);
  const [isSearching, setIsSearching] = useState(false); 
  const [jobSearchError, setJobSearchError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const dataToDisplay: CareerData | null = analysis
    ? (currentView === 'full-time' ? analysis.full_time_analysis : analysis.internship_analysis)
    : null;

  const hasValidAnalysis = analysis && analysis.full_time_analysis && analysis.internship_analysis;

  useEffect(() => {
    const initialPaths = dataToDisplay?.careerPaths || [];
    const validInitialPaths = initialPaths.filter(p => p?.role);

    setDisplayedJobs(validInitialPaths);
    setChartPaths(validInitialPaths);
    setJobSearchError(null);
    
    if (validInitialPaths.length > 0) {
      const sortedPaths = [...validInitialPaths].sort((a, b) => b.matchPercentage - a.matchPercentage);
      setSelectedPath(sortedPaths[0]);
    } else {
      setSelectedPath(null);
    }
  }, [currentView, analysis]);
  
  const handleJobSearch = async () => {
    // FIXED: Added a guard clause to prevent running if essential data is missing.
    if (!searchTerm.trim() || isSearching || !dataToDisplay?.extractedSkills) return;

    setIsSearching(true);
    setLoadingMessage(`Searching for "${searchTerm}" roles...`);
    setJobSearchError(null);
    
    const newJobs = await fetchJobsByQuery(searchTerm, currentView);
    
    // Process new jobs to add calculated data for charts and cards
    const resumeSkills = new Set(dataToDisplay.extractedSkills.map(s => s.name.toLowerCase()));
    
    newJobs.forEach(job => {
        const jobText = (job.description + " " + job.role).toLowerCase();
        const jobWords = new Set(jobText.match(/\b(\w+)\b/g) || []);
        
        const matchingSkills = [...resumeSkills].filter(skill => jobWords.has(skill));
        const skillsToDevelop = [...jobWords].filter(word => resumeSkills.has(word) === false && word.length > 2).slice(0, 3);

        const unionSize = new Set([...resumeSkills, ...jobWords]).size;
        
        // FIXED: Improved match percentage calculation to be more robust.
        job.matchPercentage = unionSize > 0 ? Math.round((matchingSkills.length / unionSize) * 200) : 0; // Scaled for better visualization
        job.relevantSkills = matchingSkills.map(name => ({ name }));
        job.skillsToDevelop = skillsToDevelop.map(name => ({ name }));
        
        // FIXED: Simplified placeholder proficiency analysis logic.
        const proficiencySkills = [...matchingSkills.slice(0, 4), 'Teamwork'];
        job.skillProficiencyAnalysis = proficiencySkills.map(skill => ({
          skill: skill,
          userProficiency: 50 + Math.random() * 25, // Random value for demonstration
          requiredProficiency: 75 + Math.random() * 20,
        }));
    });

    const sortedNewJobs = newJobs.sort((a,b) => b.matchPercentage - a.matchPercentage);
    
    setDisplayedJobs(sortedNewJobs);
    setChartPaths(sortedNewJobs);
    
    if (sortedNewJobs.length > 0) {
      setSelectedPath(sortedNewJobs[0]);
    } else {
      setSelectedPath(null);
      setChartPaths([]); // Clear charts if no results
      setJobSearchError('No jobs found for this search. Please try a different role or keyword.');
    }

    setIsSearching(false);
  };

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
      <FullScreenLoader isVisible={isSearching} message={loadingMessage} />

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

        <div className="relative flex w-full max-w-sm mx-auto items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-card p-1 border border-gray-200 dark:border-neutral-800">
          <motion.div
            layout
            className="absolute left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] bg-gradient-to-r from-red-500 to-pink-500 rounded-md shadow"
            animate={{ x: currentView === 'internship' ? '100%' : '0%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
          <button
            onClick={() => setCurrentView('full-time')}
            className={`relative z-10 w-1/2 py-2.5 text-sm font-bold transition-colors duration-300 ${currentView === 'full-time' ? 'text-white' : 'text-gray-500 dark:text-neutral-400'}`}
          >
            Full-Time
          </button>
          <button
            onClick={() => setCurrentView('internship')}
            className={`relative z-10 w-1/2 py-2.5 text-sm font-bold transition-colors duration-300 ${currentView === 'internship' ? 'text-white' : 'text-gray-500 dark:text-neutral-400'}`}
          >
            Internship
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

            {chartPaths.length > 0 ? (
              <motion.div className="p-4 sm:p-8" variants={itemVariants}>
                 <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Career Path Deep Dive</h2>
                 <div className="w-full mb-8" style={{ height: '500px' }}>
                    <CompatibilityChart paths={chartPaths} selectedRole={selectedPath?.role ?? null} />
                 </div>
                  <div className="relative max-w-lg mx-auto">
                    <select
                      value={selectedPath?.role || ''}
                      onChange={(e) => { const path = chartPaths.find(p => p.role === e.target.value); if (path) setSelectedPath(path); }}
                      className="w-full appearance-none bg-white dark:bg-dark-card border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white text-lg py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D55] transition-all"
                    >
                      {chartPaths.map(path => ( <option key={`${path.role}-${path.employer_name}`} value={path.role}>{path.role}</option>))}
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
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                Recommended Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {displayedJobs.map((job) => (
                    // FIXED: Using a more stable key
                    <JobCard key={`${job.role}-${job.employer_name}-${job.job_link}`} job={job} variants={itemVariants} />
                  ))}
                </AnimatePresence>
              </div>
              {displayedJobs.length === 0 && !isSearching && (
                <p className="text-center text-gray-500 dark:text-neutral-500 mt-8">
                  No opportunities found based on your resume. Try a new search below.
                </p>
              )}
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="mt-16 text-center bg-white/30 dark:bg-black/20 border border-gray-200 dark:border-neutral-800 p-8 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Not seeing the right fit?</h3>
              <p className="text-gray-600 dark:text-neutral-400 mt-2">
                Search for a different role or technology to discover more opportunities.
              </p>
              <div className="flex items-center gap-2 w-full max-w-md mx-auto mt-6">
                <div className="relative w-full">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g., 'Data Scientist', 'React Native'"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJobSearch()}
                    className="w-full bg-white dark:bg-dark-card border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#FF2D55] focus:outline-none transition"
                  />
                </div>
                <button
                  onClick={handleJobSearch}
                  disabled={isSearching || !searchTerm.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-full hover:brightness-110 transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  Search
                </button>
              </div>
               {jobSearchError && (
                <p className="text-red-500 dark:text-red-400 mt-4 text-sm">{jobSearchError}</p>
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
            made with ❤️ by Kaivalya 
      </footer>
    </AnimatedPage>
  );
};

export default Analysis;