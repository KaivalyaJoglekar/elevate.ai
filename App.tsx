import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ✅ 1. IMPORT THE CORRECT TOP-LEVEL TYPE
// The state will hold the entire object with both analyses.
import type { DualAnalysisData } from './types';
import { ResumeAnalysisContext } from './hooks/useResumeContext';
import { ThemeProvider } from './hooks/useTheme';

import Layout from './components/Layout';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';

function App() {
  // ✅ 2. UPDATE THE STATE'S TYPE TO MATCH
  // The 'analysis' state now correctly holds the DualAnalysisData object.
  const [analysis, setAnalysis] = useState<DualAnalysisData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // This context value now correctly matches the ResumeAnalysisContextType
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

// This helper component remains the same
const RoutesWithLocation = () => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Upload />} />
            <Route path="/analysis" element={<Analysis />} />
        </Routes>
    );
}

export default App;
