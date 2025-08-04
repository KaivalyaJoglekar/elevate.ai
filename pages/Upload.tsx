import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

import { useResumeContext } from '../hooks/useResumeContext';
import { readFileAsBase64 } from '../utils/fileParser';
import { analyzeResume } from '../services/backendService';

import AnimatedPage from '../components/AnimatedPage';
import ThemeToggleButton from '../components/ThemeToggleButton';
import FullScreenLoader from '../components/FullScreenLoader';
import { CloudArrowUpIcon, MagnifyingGlassIcon } from '../components/icons';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

const Upload: React.FC = () => {
    // ✅ FIXED: Correctly import 'isLoading' from the context
    const { setAnalysis, setIsLoading, isLoading, setError, error, file, setFile, setFileName } = useResumeContext();
    const navigate = useNavigate();
    
    const [loadingMessage, setLoadingMessage] = useState('Waking up the server...');

    const handleAnalyze = async () => {
        if (!file) return;
        
        // This is the single source of truth for the loading state
        setIsLoading(true); 
        setError(null);
        setFileName(file.name);
        setLoadingMessage('Waking up the server...');

        try {
            // Wake-up ping
            await fetch(BACKEND_URL);

            setLoadingMessage('AI analysis in progress...');
            const base64Content = await readFileAsBase64(file);
            const result = await analyzeResume(base64Content);
            
            setAnalysis(result);
            navigate('/analysis');

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false); // Turn off loading state in all cases
        }
    };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);
    if (fileRejections.length > 0) {
        const firstRejection = fileRejections[0];
        const firstError = firstRejection.errors[0];
        if (firstError.code === 'file-too-large') {
            setError(`File is too large. Please upload a file under ${MAX_FILE_SIZE_MB}MB.`);
        } else {
            setError(firstError.message);
        }
        setFile(null);
        return;
    }

    if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
    }
  }, [setFile, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
  });

  return (
    <AnimatedPage>
      {/* ✅ FIXED: The loader's visibility is now correctly controlled by the 'isLoading' state. */}
      <FullScreenLoader isVisible={isLoading} message={loadingMessage} />
      <div className="min-h-screen text-gray-800 dark:text-light-text flex flex-col items-center">
        <header className="w-full max-w-6xl mx-auto flex justify-end items-center py-4 px-4 sm:px-0">
            <ThemeToggleButton />
        </header>
        
        <main className="w-full text-center flex-grow flex flex-col items-center justify-center">
            <motion.div 
                className="w-full max-w-2xl flex flex-col items-center"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-500">
                  Elevate Your Career Profile
                </motion.h1>
                <motion.p variants={itemVariants} className="mt-3 text-lg md:text-xl text-gray-600 dark:text-subtle-text">
                  Upload your resume for a dual analysis for full-time and internship roles.
                </motion.p>
                
                <motion.div variants={itemVariants} className="w-full max-w-lg mt-10">
                    <div
                        {...getRootProps()}
                        className={`relative p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group
                            ${isDragActive 
                                ? 'border-brand-purple bg-brand-purple/10 scale-105 shadow-[0_0_25px_rgba(139,92,246,0.5)]' 
                                : 'border-gray-300 dark:border-neutral-700 hover:border-brand-purple hover:bg-brand-purple/5'}`
                            }
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-center transition-transform duration-300 group-hover:scale-105">
                            <CloudArrowUpIcon className={`h-12 w-12 text-gray-400 dark:text-subtle-text mb-4 transition-colors ${isDragActive ? 'text-brand-purple' : ''}`}/>
                            <p className="text-xl font-semibold text-gray-700 dark:text-light-text">Upload Your Resume</p>
                            <p className="text-gray-500 dark:text-subtle-text mt-1">Click or drag & drop (PDF only)</p>
                        </div>
                    </div>
                    {file && !isLoading && (
                        <div className="text-center mt-4">
                            <p className="text-sm text-green-600 dark:text-green-400">Selected: {file.name}</p>
                        </div>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8">
                    {/* ✅ FIXED: The button's disabled state is now correctly controlled by 'isLoading'. */}
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || isLoading}
                        className="flex items-center justify-center px-10 py-3 text-lg font-semibold text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed bg-gradient-to-br from-red-500 to-pink-500 hover:brightness-110 disabled:brightness-50"
                    >
                        {/* ✅ FIXED: The button's text is now correctly controlled by 'isLoading'. */}
                        {isLoading ? (
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                                {loadingMessage}
                            </>
                        ) : (
                            <>
                                <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                                Start Analysis
                            </>
                        )}
                    </button>
                </motion.div>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg max-w-lg text-left"
                    >
                        <h3 className="font-bold">Analysis Failed</h3>
                        <p>{error}</p>
                    </motion.div>
                )}
            </motion.div>
        </main>
      </div>
      <footer className="w-full max-w-6xl mx-auto text-center py-4 bg-transparent">
          <p className="text-gray-500 dark:text-subtle-text text-sm">
              made with ❤️ by Kaivalya
          </p>
      </footer>
    </AnimatedPage>
  );
};

export default Upload;