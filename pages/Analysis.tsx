import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { useResumeContext } from '../hooks/useResumeContext';
import { fetchJobsByQuery } from '../services/backendService';
import type { CareerPath, CareerData } from '../types';

import AnimatedPage from '../components/AnimatedPage';
import ScrollReveal from '../components/ScrollReveal';
import AtsScoreCard from '../components/ATSMeter';
import SummaryCard from '../components/SummaryCard';
import TipsPanel from '../components/TipsPanel';
import { JobCard } from '../components/JobCard';
import AnalysisSkeleton from '../components/AnalysisSkeleton';
import CompatibilityChart from '../components/BarGraph';

import {
  AcademicCapIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  PuzzlePieceIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '../components/icons';

const DeepDiveSection = lazy(() => import('../components/DeepDiveSection'));

const heroVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const leftVariants: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const JobSkeleton = () => (
  <div className="bg-black/45 border border-white/[0.04] h-52 animate-pulse p-6 rounded-2xl">
    <div className="mb-4 h-5 w-3/4 rounded bg-white/10" />
    <div className="mb-6 h-3 w-1/2 rounded bg-white/5" />
    <div className="mb-5 flex gap-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-6 w-16 rounded-full bg-white/10" />
      ))}
    </div>
    <div className="mt-auto h-10 w-full rounded-xl bg-white/5" />
  </div>
);

type AnalysisView = 'full-time' | 'internship';

const Analysis: React.FC = () => {
  const { analysis, setAnalysis, setFileName, setFile } = useResumeContext();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<AnalysisView>('full-time');
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [isSwitchingView, setIsSwitchingView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const dataToDisplay: CareerData | undefined = useMemo(
    () => analysis
      ? (currentView === 'full-time' ? analysis.full_time_analysis : analysis.internship_analysis)
      : undefined,
    [analysis, currentView],
  );

  const defaultQuery = useMemo(() => {
    const skills = dataToDisplay?.extractedSkills?.slice(0, 3).map(s => s.name) ?? [];
    return skills.join(' ');
  }, [dataToDisplay]);

  const {
    data: jobResults,
    isLoading: jobsLoading,
    isError: jobsError,
  } = useQuery({
    queryKey: ['jobs', searchQuery || defaultQuery, currentView],
    queryFn: () => fetchJobsByQuery(searchQuery || defaultQuery, currentView),
    enabled: !!(searchQuery || defaultQuery),
    staleTime: 5 * 60 * 1000,
  });

  const displayedJobs: CareerPath[] = jobResults ?? dataToDisplay?.careerPaths ?? [];

  useEffect(() => {
    setIsSwitchingView(true);
    const timeoutId = setTimeout(() => setIsSwitchingView(false), 260);
    return () => clearTimeout(timeoutId);
  }, [currentView]);

  useEffect(() => {
    if (displayedJobs.length > 0) {
      if (!selectedPath || !displayedJobs.find(p => p.role === selectedPath.role)) {
        const top = [...displayedJobs].sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0));
        setSelectedPath(top[0]);
      }
    } else {
      setSelectedPath(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedJobs]);

  const handleJobSearch = useCallback(() => {
    if (!searchTerm.trim()) return;
    setSearchQuery(searchTerm.trim());
  }, [searchTerm]);

  const handleReset = useCallback(() => {
    setAnalysis(null);
    setFileName(null);
    setFile(null);
    navigate('/');
  }, [navigate, setAnalysis, setFile, setFileName]);

  if (!analysis) return <Navigate to="/" replace />;
  if (!dataToDisplay || isSwitchingView) return <AnalysisSkeleton />;

  return (
    <AnimatedPage>
      <motion.header
        className="mb-10 flex flex-wrap items-center justify-between gap-4 z-50 relative"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Analysis complete
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-xl border border-white/10 glass px-5 py-2.5 text-sm font-semibold text-light-text shadow-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
          >
            New analysis
          </button>
        </div>
      </motion.header>

      <motion.main className="space-y-16 relative z-10" variants={containerVariants} initial="hidden" animate="visible">
        <motion.section variants={heroVariants} className="bg-black/45 gradient-border rounded-3xl relative overflow-hidden p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent-primary/20 blur-3xl opacity-60" />
          <div className="pointer-events-none absolute -bottom-12 left-12 h-56 w-56 rounded-full bg-accent-secondary/20 blur-3xl opacity-60" />

          <div className="relative z-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-accent-primary">
              <SparklesIcon className="h-4 w-4" />
              Personalized Career Blueprint
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-tight text-light-text md:text-5xl lg:text-6xl">
              {dataToDisplay.name}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-subtle-text">
              {dataToDisplay.summary}
            </p>
          </div>
        </motion.section>

        <motion.div variants={itemVariants} className="flex justify-center -mt-6 relative z-20">
          <div
            className={`relative flex items-center rounded-xl p-1 shadow-lg transition-colors duration-300 ${
              currentView === 'full-time'
                ? 'border border-emerald-400/28 bg-emerald-500/12'
                : 'border border-accent-secondary/30 bg-accent-secondary/12'
            }`}
          >
            <motion.div
              layout
              className={`absolute h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-lg border ${
                currentView === 'full-time'
                  ? 'bg-emerald-500/25 border-emerald-300/35'
                  : 'bg-accent-secondary/25 border-accent-secondary/40'
              }`}
              animate={{ x: currentView === 'internship' ? '100%' : '0%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            {(['full-time', 'internship'] as AnalysisView[]).map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`w-32 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${
                  currentView === view
                    ? 'text-white'
                    : 'text-subtle-text hover:text-white/80'
                }`}
              >
                {view === 'full-time' ? 'Full-Time' : 'Internship'}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <ScrollReveal delay={0.05}>
              <SummaryCard
                icon={<PuzzlePieceIcon className="h-5 w-5 text-accent-primary" />}
                title="Key Skills"
                items={dataToDisplay.extractedSkills ?? []}
                displayAs="pills"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <TipsPanel
                title="Resume Improvements"
                icon={<PencilSquareIcon className="h-5 w-5 text-emerald-400" />}
                tips={dataToDisplay.generalResumeImprovements ?? []}
                color="green"
              />
            </ScrollReveal>

            <ScrollReveal delay={0.19}>
              <TipsPanel
                title="Upskilling Suggestions"
                icon={<AcademicCapIcon className="h-5 w-5 text-accent-secondary" />}
                tips={dataToDisplay.generalUpskillingSuggestions ?? []}
                color="blue"
              />
            </ScrollReveal>
          </div>

          <div className="space-y-10 lg:sticky lg:top-24">
            <motion.div variants={leftVariants}>
              <AtsScoreCard score={dataToDisplay.atsScore.score} feedback={dataToDisplay.atsScore.feedback} />
            </motion.div>

            {dataToDisplay.experienceSummary?.length > 0 && (
              <motion.div variants={leftVariants}>
                <SummaryCard
                  icon={<BriefcaseIcon className="h-5 w-5 text-brand-sun" />}
                  title="Experience"
                  items={dataToDisplay.experienceSummary}
                  displayAs="list"
                />
              </motion.div>
            )}

            {dataToDisplay.educationSummary?.length > 0 && (
              <motion.div variants={leftVariants}>
                <SummaryCard
                  icon={<AcademicCapIcon className="h-5 w-5 text-accent-secondary" />}
                  title="Education"
                  items={dataToDisplay.educationSummary}
                  displayAs="list"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {displayedJobs.length > 0 && (
          <ScrollReveal>
            <section className="bg-black/45 rounded-3xl space-y-10 p-8 sm:p-12 border border-white/[0.08] relative overflow-hidden">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-accent-secondary/45" />

              <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="inline-flex items-center rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-accent-secondary">
                    Role Match Diagnostics
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-light-text">Career Path Deep Dive</h2>
                </div>

                {selectedPath && (
                  <div className="inline-flex items-center rounded-full border border-white/[0.12] bg-black/35 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-subtle-text">
                    Selected: <span className="ml-2 text-light-text">{selectedPath.role}</span>
                  </div>
                )}
              </div>

              <div className="relative mx-auto max-w-lg z-10">
                <select
                  value={selectedPath?.role ?? ''}
                  onChange={event => {
                    const path = displayedJobs.find(candidate => candidate.role === event.target.value);
                    if (path) setSelectedPath(path);
                  }}
                  className="input-shell bg-black/35 border border-white/[0.08] w-full appearance-none py-4 pl-5 pr-12 text-base rounded-2xl focus:border-accent-secondary/60 text-light-text"
                >
                  {displayedJobs.map(path => (
                    <option key={`${path.role}-${path.employer_name}`} value={path.role} className="bg-bg-primary text-light-text">
                      {path.role}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>

              <Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-3xl bg-white/5" />}>
                <div className="min-h-[400px] w-full relative z-10" style={{ height: 400 }}>
                  <CompatibilityChart paths={displayedJobs} selectedRole={selectedPath?.role ?? null} />
                </div>
              </Suspense>

              <AnimatePresence mode="wait">
                {selectedPath && (
                  <Suspense fallback={<div className="mt-10 h-[450px] w-full animate-pulse rounded-3xl bg-white/5" />}>
                    <DeepDiveSection key={selectedPath.role} path={selectedPath} />
                  </Suspense>
                )}
              </AnimatePresence>
            </section>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.05}>
          <section className="recommended-shell rounded-[2rem] p-8 sm:p-10">
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-accent-secondary">
                    Live Market Feed
                  </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-light-text">Recommended Opportunities</h2>
                <p className="mt-3 text-base text-subtle-text">Roles fetched from distributed jobs services, ranked for your profile.</p>
                </div>

                {!jobsLoading && displayedJobs.length > 0 && (
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle-text">
                    {displayedJobs.length} Matches
                  </div>
                )}
              </div>

              {jobsLoading ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, index) => <JobSkeleton key={index} />)}
                </div>
              ) : jobsError || displayedJobs.length === 0 ? (
                  <div className="bg-black/45 rounded-3xl border border-white/[0.08] p-16 text-center">
                  <p className="font-display text-2xl font-bold text-light-text">No opportunities found</p>
                  <p className="mt-3 text-base text-subtle-text">Try a different custom search term below.</p>
                </div>
              ) : (
                <motion.div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants} initial="hidden" animate="visible">
                  {displayedJobs.map((job, index) => (
                    <motion.div key={`${job.role}-${job.employer_name}-${job.job_link}`} variants={itemVariants} custom={index} className="h-full">
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div className="recommended-search-card rounded-[2rem] p-8 text-center sm:p-12">
                <div className="relative z-10">
                  <h3 className="font-display text-3xl font-bold text-light-text">Find more roles</h3>
                  <p className="mt-3 text-base text-subtle-text">Search another title, domain, technology, or company.</p>

                  <div className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Data Scientist, Product Analyst, React Native"
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.target.value)}
                        onKeyDown={event => event.key === 'Enter' && handleJobSearch()}
                        className="input-shell bg-black/35 border border-white/10 pl-14 py-4 rounded-2xl w-full focus:border-accent-secondary/70 focus:bg-black/45 transition-all text-light-text placeholder:text-subtle-text"
                      />
                    </div>

                    <motion.button
                      onClick={handleJobSearch}
                      disabled={!searchTerm.trim() || jobsLoading}
                      whileHover={searchTerm.trim() ? { scale: 1.03 } : {}}
                      whileTap={searchTerm.trim() ? { scale: 0.97 } : {}}
                      className="rounded-2xl bg-[#121218] border border-white/[0.14] hover:bg-[#171720] hover:border-accent-secondary/40 px-8 py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap shadow-[0_10px_24px_rgba(0,0,0,0.38)]"
                    >
                      {jobsLoading ? 'Searching...' : 'Search'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </motion.main>

      <footer className="mt-20 pb-6 text-center text-xs font-medium tracking-wide text-subtle-text relative z-10">
        crafted for scalable career intelligence
      </footer>
    </AnimatedPage>
  );
};

export default Analysis;