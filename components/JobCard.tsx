// components/JobCard.tsx

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { CareerPath } from '../types';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';

interface JobCardProps {
  job: CareerPath;
}

const matchMeta = (pct: number) => {
  if (pct >= 85) {
    return {
      scoreText: 'text-emerald-300',
      bar: 'bg-emerald-400',
      tone: 'Excellent Match',
    };
  }

  if (pct >= 70) {
    return {
      scoreText: 'text-accent-secondary',
      bar: 'bg-accent-secondary',
      tone: 'Strong Match',
    };
  }

  return {
    scoreText: 'text-orange-300',
    bar: 'bg-orange-400',
    tone: 'Potential Match',
  };
};

export const JobCard = memo<JobCardProps>(({ job }) => {
  const { scoreText, bar, tone } = matchMeta(job.matchPercentage);
  const visibleSkills = job.relevantSkills?.slice(0, 3) ?? [];
  const extraSkillsCount = Math.max((job.relevantSkills?.length ?? 0) - visibleSkills.length, 0);
  const clampedMatch = Math.max(0, Math.min(100, job.matchPercentage || 0));

  return (
    <motion.div
      className="bg-black/50 rounded-3xl border border-white/20 relative group flex h-full flex-col overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-accent-secondary/45 hover:shadow-[0_20px_45px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex-grow">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-subtle-text">
                Opportunity
              </p>
              <h3 className="mt-2.5 line-clamp-2 text-xl font-bold leading-snug text-light-text group-hover:text-white transition-colors">
                {job.role}
              </h3>
            </div>

            {job.matchPercentage > 0 && (
              <motion.span
                className={`flex-shrink-0 ml-2 text-xl font-black tabular-nums ${scoreText}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 }}
              >
                {job.matchPercentage}%
              </motion.span>
            )}
          </div>

          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-text">
            {tone}
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-3">
            {job.employer_logo ? (
              <img src={job.employer_logo} alt="" className="h-6 w-6 rounded object-contain" />
            ) : (
              <div className="h-6 w-6 rounded border border-white/[0.08] bg-black/40 flex items-center justify-center">
                <span className="text-[10px] text-subtle-text font-bold">{job.employer_name?.charAt(0) || 'C'}</span>
              </div>
            )}
            <p className="truncate text-sm font-semibold text-light-text/90">
              {job.employer_name || 'Confidential'}
            </p>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-text">
              <span>Role Fit</span>
              <span className="text-light-text">{clampedMatch}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${clampedMatch}%` }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {visibleSkills.map(skill => (
              <span
                key={skill.name}
                className="rounded-lg border border-white/[0.1] bg-black/35 px-2.5 py-1.5 text-[11px] font-semibold text-light-text/85"
              >
                {skill.name}
              </span>
            ))}

            {extraSkillsCount > 0 && (
              <span className="rounded-lg border border-accent-secondary/30 bg-accent-secondary/10 px-2.5 py-1.5 text-[11px] font-semibold text-accent-secondary">
                +{extraSkillsCount} more
              </span>
            )}
          </div>
        </div>

        {job.job_link && (
          <motion.a
            href={job.job_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center mt-6 px-4 py-3 rounded-xl text-sm font-bold text-white
              bg-black/40 hover:bg-black/55 border border-white/[0.12] hover:border-accent-secondary/35
              flex items-center justify-center gap-2 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Open Role <ArrowTopRightOnSquareIcon className="w-4 h-4 text-subtle-text" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
});