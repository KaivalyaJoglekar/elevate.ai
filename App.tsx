import { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { DualAnalysisData } from './types';
import { ResumeAnalysisContext } from './hooks/useResumeContext';
import { ThemeProvider } from './hooks/useTheme';

import Layout from './components/Layout';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const [analysis, setAnalysis] = useState<DualAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const contextValue = {
    analysis, setAnalysis,
    isLoading, setIsLoading,
    error, setError,
    fileName, setFileName,
    file, setFile,
  };

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

const RoutesWithLocation = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Upload />} />
      <Route path="/analysis" element={<Analysis />} />
    </Routes>
  );
};

export default App;
