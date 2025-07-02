
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import type { CareerData } from './types';
import { ResumeAnalysisContext } from './hooks/useResumeContext';
import { ThemeProvider } from './hooks/useTheme';

import Layout from './components/Layout';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';

function App() {
  const [analysis, setAnalysis] = useState<CareerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const contextValue = {
    analysis,
    setAnalysis,
    isLoading,
    setIsLoading,
    error,
    setError,
    fileName,
    setFileName,
    file,
    setFile,
  };

  return (
    <ThemeProvider>
      <ResumeAnalysisContext.Provider value={contextValue}>
        <HashRouter>
          <Layout>
            <AnimatePresence mode="wait">
               <RoutesWithLocation />
            </AnimatePresence>
          </Layout>
        </HashRouter>
      </ResumeAnalysisContext.Provider>
    </ThemeProvider>
  );
}

// Separate component to use useLocation hook
const RoutesWithLocation = () => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Upload />} />
            <Route path="/analysis" element={<Analysis />} />
        </Routes>
    );
}

<footer className="text-center mt-16 text-gray-500 dark:text-subtle-text text-sm">
            made with ❤️ by Kaivalya
      </footer>
export default App;