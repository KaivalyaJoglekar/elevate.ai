import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';

import { useResumeContext } from '../hooks/useResumeContext';
import { readFileAsBase64 } from '../utils/fileParser';
import { analyzeResume } from '../services/backendService';

import AnimatedPage from '../components/AnimatedPage';
import FullScreenLoader from '../components/FullScreenLoader';
import { CloudArrowUpIcon, MagnifyingGlassIcon, SparklesIcon } from '../components/icons';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const STEP_TIMING_MS = [0, 3200, 7400, 11200];

const metrics = [
    { label: 'Signal Extraction', value: '97%' },
    { label: 'Role Matches', value: '10+' },
    { label: 'ATS Evaluation', value: 'Real-time' },
];

const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
    hidden: { y: 26, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 90, damping: 16 } },
};

const Upload: React.FC = () => {
    const { setAnalysis, setIsLoading, setError, error, file, setFile, setFileName } = useResumeContext();
    const navigate = useNavigate();

    const abortControllerRef = useRef<AbortController | null>(null);
    const stepTimerRef = useRef<number[]>([]);
    const [activeStep, setActiveStep] = useState(0);

    const clearStepTimers = useCallback(() => {
        stepTimerRef.current.forEach(id => window.clearTimeout(id));
        stepTimerRef.current = [];
    }, []);

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            clearStepTimers();
        };
    }, [clearStepTimers]);

    const { mutate: runAnalysis, isPending } = useMutation({
        mutationFn: async (selectedFile: File) => {
            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            const base64Content = await readFileAsBase64(selectedFile);
            return analyzeResume(base64Content, controller.signal);
        },
        onMutate: () => {
            setIsLoading(true);
            setError(null);
            setActiveStep(0);
            clearStepTimers();
            stepTimerRef.current = STEP_TIMING_MS.slice(1).map((ms, index) => (
                window.setTimeout(() => setActiveStep(index + 1), ms)
            ));
        },
        onSuccess: result => {
            setIsLoading(false);
            clearStepTimers();
            setAnalysis(result);
            navigate('/analysis');
        },
        onError: (err: unknown) => {
            setIsLoading(false);
            clearStepTimers();
            if (err instanceof Error && err.name === 'AbortError') return;

            const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
            if (msg.includes('504') || msg.toLowerCase().includes('timeout')) {
                setError('The analysis service timed out. Please retry in a moment.');
            } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
                setError('Unable to reach the backend. Check connection and try again.');
            } else if (msg.toLowerCase().includes('file processing') || msg.includes('400')) {
                setError('The uploaded file could not be parsed. Please use a clean PDF resume.');
            } else {
                setError('Something unexpected happened. Please retry.');
            }
        },
    });

    const handleAnalyze = useCallback(() => {
        if (!file || isPending) return;
        setFileName(file.name);
        runAnalysis(file);
    }, [file, isPending, runAnalysis, setFileName]);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setError(null);

        if (fileRejections.length > 0) {
            const firstError = fileRejections[0].errors[0];
            setError(firstError.code === 'file-too-large'
                ? `File is too large. Max ${MAX_FILE_SIZE_MB}MB.`
                : firstError.message);
            setFile(null);
            return;
        }

        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, [setError, setFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        maxSize: MAX_FILE_SIZE_BYTES,
    });

    const fileSummary = useMemo(
        () => file ? `${(file.size / 1024).toFixed(0)} KB` : null,
        [file],
    );

    return (
        <AnimatedPage>
            <FullScreenLoader isVisible={isPending} activeStep={activeStep} />

            <div className="relative min-h-[calc(100vh-6rem)] w-full flex flex-col pt-8 pb-16">
                <main className="grid flex-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 relative z-10">
                    <motion.section
                        variants={staggerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-primary overflow-hidden relative">
                            <span className="absolute inset-0 shimmer pointer-events-none" />
                            <SparklesIcon className="h-3.5 w-3.5 relative z-10" />
                            <span className="relative z-10">Career Intelligence Studio</span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="mt-6 font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl text-light-text text-balance"
                        >
                            Make your resume
                            <span className="block mt-2 animated-gradient-text text-transparent pb-2">
                                impossible to ignore.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="mt-6 max-w-lg text-lg leading-relaxed text-subtle-text"
                        >
                            Upload one PDF and receive a dual-track strategy for full-time and internship roles, including ATS diagnostics,
                            skill gaps, and live opportunity matches.
                        </motion.p>

                        <motion.div variants={itemVariants} className="mt-12 grid gap-4 sm:grid-cols-3">
                            {metrics.map(metric => (
                                <div key={metric.label} className="glass rounded-2xl p-5 hover-lift border border-white/5 transition-all duration-300">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-primary/80">{metric.label}</p>
                                    <p className="mt-3 font-display text-3xl font-bold glow-text text-light-text">{metric.value}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-8 sm:p-10 shadow-2xl"
                    >
                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-semibold tracking-tight text-light-text sm:text-3xl">Upload your resume</h2>
                                <p className="mt-2 text-sm text-subtle-text">PDF format, max {MAX_FILE_SIZE_MB}MB.</p>
                            </div>

                            <div className="mt-8 relative">
                                <div
                                    {...getRootProps()}
                                    className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 overflow-hidden
                                        ${isDragActive
                                            ? 'border-accent-primary bg-accent-primary/5'
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <input {...getInputProps()} />

                                    <motion.div
                                        animate={isDragActive ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
                                        className={'mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-light-text mb-6'}
                                    >
                                        <CloudArrowUpIcon className="h-6 w-6 opacity-80" />
                                    </motion.div>

                                    <p className="text-base font-medium text-light-text">
                                        {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                                    </p>
                                    <p className="mt-2 text-sm text-subtle-text">
                                        or <span className="font-medium text-light-text hover:underline underline-offset-4 transition-all">browse files</span>
                                    </p>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {file && !isPending && (
                                    <motion.div
                                        key="file-ready"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-6 flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                                            ✓
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-light-text">{file.name}</p>
                                            {fileSummary && <p className="text-xs text-subtle-text mt-0.5">{fileSummary}</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                onClick={handleAnalyze}
                                disabled={!file || isPending}
                                whileHover={file && !isPending ? { scale: 1.01 } : {}}
                                whileTap={file && !isPending ? { scale: 0.99 } : {}}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white text-black px-6 py-3.5 text-sm font-semibold transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                            >
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                <span>{isPending ? 'Analyzing...' : 'Analyze Resume'}</span>
                            </motion.button>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm"
                                    >
                                        <p className="font-medium text-red-400">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>
                </main>

                <footer className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-subtle-text font-medium tracking-wide z-10 relative">
                    built by Kaivalya <span className="mx-2 opacity-50">•</span> powered by distributed AI services
                </footer>
            </div>
        </AnimatedPage>
    );
};

export default Upload;