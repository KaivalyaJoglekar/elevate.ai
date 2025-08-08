// src/components/JobCard.tsx

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { CareerPath } from '../types';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';

interface JobCardProps {
  job: CareerPath;
}

export const JobCard = memo<JobCardProps>(({ job }) => {
  return (
    <motion.div
      className="bg-white/50 dark:bg-black/30 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-glow flex flex-col group transition-all duration-300 hover:border-pink-500/50"
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 dark:text-light-text group-hover:text-pink-500 transition-colors">{job.role}</h3>
          {job.matchPercentage > 0 && (
            <span className="flex-shrink-0 ml-4 px-3 py-1 text-sm font-bold bg-pink-500/10 text-pink-500 rounded-full">
              {job.matchPercentage}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-subtle-text mb-4">{job.employer_name || 'Confidential'}</p>
        <div className="flex flex-wrap gap-2">
            {job.relevantSkills?.slice(0, 3).map(skill => (
                <span key={skill.name} className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  {skill.name}
                </span>
            ))}
        </div>
      </div>
      
      {job.job_link && (
        <a
          href={job.job_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center mt-6 px-4 py-2 bg-gradient-to-r from-brand-purple to-pink-500 text-white font-semibold rounded-lg hover:brightness-110 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          Apply Now <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
});