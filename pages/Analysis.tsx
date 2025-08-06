// src/pages/Analysis.tsx

import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';

import { useResumeContext } from '../hooks/useResumeContext';
import { fetchJobsByQuery } from '../services/backendService';
import type { CareerPath, CareerData } from '../types';

import AnimatedPage from '../components/AnimatedPage';
import AtsScoreCard from '../components/ATSMeter';
import SummaryCard from '../components/SummaryCard';
import DeepDiveSection from '../components/DeepDiveSection';
import TipsPanel from '../components/TipsPanel';
import CompatibilityChart from '../components/BarGraph';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { JobCard } from '../components/JobCard';
import AnalysisSkeleton from '../components/AnalysisSkeleton';
import FullScreenLoader from '../components/FullScreenLoader';

import {
    AcademicCapIcon, BriefcaseIcon, PencilSquareIcon, PuzzlePieceIcon,
    ChevronDownIcon, MagnifyingGlassIcon
} from '../components/icons';

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

type AnalysisView = 'full-time' | 'internship';

const Analysis: React.FC = () => {
  const { analysis, setAnalysis, setFileName, setFile } = useResumeContext();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AnalysisView>('full-time');
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [isSwitchingView, setIsSwitchingView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedJobs, setDisplayedJobs] = useState<CareerPath[]>([]);
  const [chartPaths, setChartPaths] = useState<CareerPath[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [jobSearchError, setJobSearchError] = useState<string | null>(null);

  const dataToDisplay: CareerData | undefined = analysis
    ? (currentView === 'full-time' ? analysis.full_time_analysis : analysis.internship_analysis)
    : undefined;

  useEffect(() => {
    setIsSwitchingView(true);
    if (dataToDisplay) {
        const paths = dataToDisplay.careerPaths || [];
        setDisplayedJobs(paths);
        setChartPaths(paths);
        if (paths.length > 0) {
            const sortedPaths = [...paths].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
            setSelectedPath(sortedPaths[0]);
        } else {
            setSelectedPath(null);
        }
    }
    const timer = setTimeout(() => setIsSwitchingView(false), 300);
    return () => clearTimeout(timer);
  }, [currentView, analysis]);

  const handleJobSearch = async () => {
    if (!searchTerm.trim() || isSearching) return;
    setIsSearching(true);
    setJobSearchError(null);
    const newJobs = await fetchJobsByQuery(searchTerm, currentView);
    newJobs.forEach(job => {
        job.matchPercentage = Math.floor(Math.random() * (95 - 60 + 1) + 60);
        job.relevantSkills = dataToDisplay?.extractedSkills?.slice(0, 3) || [];
    });
    if (newJobs.length > 0) {
        setDisplayedJobs(newJobs);
        setChartPaths([]);
        setSelectedPath(null);
    } else {
        setJobSearchError('No jobs found for this search.');
    }
    setIsSearching(false);
  };
  
  const handleReset = () => {
    setAnalysis(null); setFileName(null); setFile(null);
    navigate('/');
  };

  if (!analysis) { return <Navigate to="/" replace />; }
  if (!dataToDisplay || isSwitchingView) { return <AnalysisSkeleton />; }

  return (
    <AnimatedPage>
      <FullScreenLoader isVisible={isSearching} message={`Searching for "${searchTerm}" jobs...`} />
      
      <header className="mb-12 flex items-center justify-end gap-2">
        <button onClick={handleReset} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800/50">New Analysis</button>
        <ThemeToggleButton />
      </header>

      <main className="space-y-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">{dataToDisplay.name}</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto">{dataToDisplay.summary}</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="relative flex w-full max-w-sm mx-auto items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-card p-1 border border-gray-200 dark:border-neutral-800">
            <motion.div layout className="absolute left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] bg-gradient-to-r from-red-500 to-pink-500 rounded-md shadow" animate={{ x: currentView === 'internship' ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
            <button onClick={() => setCurrentView('full-time')} className={`relative z-10 w-1/2 py-2.5 text-sm font-bold transition-colors duration-300 ${currentView === 'full-time' ? 'text-white' : 'text-gray-500 dark:text-neutral-400'}`}>Full-Time</button>
            <button onClick={() => setCurrentView('internship')} className={`relative z-10 w-1/2 py-2.5 text-sm font-bold transition-colors duration-300 ${currentView === 'internship' ? 'text-white' : 'text-gray-500 dark:text-neutral-400'}`}>Internship</button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}><SummaryCard icon={<PuzzlePieceIcon className="w-6 h-6 text-pink-500" />} title="Key Skills" items={dataToDisplay.extractedSkills || []} displayAs="pills" /></motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}><TipsPanel title="Resume Improvements" icon={<PencilSquareIcon className="w-8 h-6 text-green-400" />} tips={dataToDisplay.generalResumeImprovements || []} color="green" /></motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}><TipsPanel title="Upskilling Suggestions" icon={<AcademicCapIcon className="w-8 h-8 text-sky-400" />} tips={dataToDisplay.generalUpskillingSuggestions || []} color="blue" /></motion.div>
            </div>
            <div className="space-y-8 lg:sticky lg:top-24">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}><AtsScoreCard score={dataToDisplay.atsScore.score} feedback={dataToDisplay.atsScore.feedback} /></motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>{dataToDisplay.experienceSummary?.length > 0 && <SummaryCard icon={<BriefcaseIcon className="w-6 h-6 text-pink-500" />} title="Experience" items={dataToDisplay.experienceSummary} displayAs="list" />}</motion.div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>{dataToDisplay.educationSummary?.length > 0 && <SummaryCard icon={<AcademicCapIcon className="w-6 h-6 text-pink-500" />} title="Education" items={dataToDisplay.educationSummary} displayAs="list" />}</motion.div>
            </div>
        </div>

        {chartPaths?.length > 0 ? (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants} className="space-y-8 rounded-2xl bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-neutral-800 p-4 sm:p-8">
             <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">Career Path Deep Dive</h2>
             <div className="relative mx-auto max-w-lg">
                <select value={selectedPath?.role || ''} onChange={(e) => { const path = chartPaths.find(p => p.role === e.target.value); if (path) setSelectedPath(path); }} className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-lg text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-neutral-700 dark:bg-dark-card dark:text-white">
                    {chartPaths.map(path => ( <option key={`${path.role}-${path.employer_name}`} value={path.role}>{path.role}</option>))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400 dark:text-neutral-500"/>
              </div>
             <div className="w-full" style={{ height: '400px' }}> <CompatibilityChart paths={chartPaths} selectedRole={selectedPath?.role ?? null} /> </div>
             <AnimatePresence mode="wait"> {selectedPath && <DeepDiveSection key={selectedPath.role} path={selectedPath} />} </AnimatePresence>
          </motion.div>
        ) : null }
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants} className="space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">Recommended Opportunities</h2>
            {displayedJobs?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{displayedJobs.map((job) => ( <JobCard key={`${job.role}-${job.employer_name}-${job.job_link}`} job={job} /> ))}</div>
            ) : (
                <div className="text-center py-12"><h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Job Opportunities Found</h2><p className="text-gray-500 dark:text-neutral-400 mt-2">Try a new search below to discover more opportunities.</p></div>
            )}
            <div className="mt-16 text-center bg-white/30 dark:bg-black/20 border border-gray-200 dark:border-neutral-800 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Find More Roles</h3>
              <p className="text-gray-600 dark:text-neutral-400 mt-2">Search for a different role or technology.</p>
              <div className="flex items-center gap-2 w-full max-w-md mx-auto mt-6">
                <div className="relative w-full">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-500 pointer-events-none" />
                  <input type="text" placeholder="e.g., 'Data Scientist', 'React Native'" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleJobSearch()} className="w-full bg-white dark:bg-dark-card border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-pink-500 focus:outline-none transition" />
                </div>
                <button onClick={handleJobSearch} disabled={isSearching || !searchTerm.trim()} className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-full hover:brightness-110 transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">Search</button>
              </div>
              {jobSearchError && ( <p className="text-red-500 dark:text-red-400 mt-4 text-sm">{jobSearchError}</p> )}
            </div>
        </motion.div>
      </main>
      <footer className="text-center mt-16 text-gray-500 dark:text-neutral-500 text-sm"> made with ❤️ by Kaivalya </footer>
    </AnimatedPage>
  );
};

export default Analysis;