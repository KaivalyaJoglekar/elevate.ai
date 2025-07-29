import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import type { CareerPath } from '../types';

// Helper for the company logo with a stylish fallback, now larger and always visible
const CompanyLogo = ({ logo, name }: { logo?: string | null; name: string }) => {
  const [imgError, setImgError] = useState(false);
  const showFallback = !logo || imgError;

  return (
    // This container is now larger to make the logo more prominent
    <div className="absolute top-4 left-4 w-14 h-14 bg-black/20 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center shadow-lg">
      {showFallback ? (
        <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
      ) : (
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-full h-full object-contain p-1.5 rounded-lg"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
};

interface JobCardProps {
  job: CareerPath;
  variants: Variants;
}

export const JobCard: React.FC<JobCardProps> = ({ job, variants }) => {
  return (
    <motion.div
      variants={variants}
      className="bg-[#1C1C1E]/70 backdrop-blur-xl border border-neutral-800 rounded-2xl flex flex-col group overflow-hidden transition-all duration-300 hover:border-neutral-700"
    >
      {/* --- Image and Logo Section --- */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-neutral-800 to-neutral-900">
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        </div>
        <CompanyLogo logo={job.employer_logo} name={job.employer_name} />
      </div>

      {/* --- Job Details Section --- */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-white mb-1 flex-grow">
          {job.role}
        </h3>
        <p className="text-sm text-neutral-400 mb-4">
          {job.employer_name}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800">
            {/* The purple match lozenge */}
            <span className="px-3 py-1 text-sm font-bold bg-indigo-500/20 text-indigo-300 rounded-md">
              {job.matchPercentage}% Match
            </span>
            {/* The reddish-pink "View" button */}
            <a 
              href={job.job_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white font-semibold rounded-lg hover:brightness-110 transform transition-transform hover:scale-105"
            >
              View
            </a>
        </div>
      </div>
    </motion.div>
  );
};