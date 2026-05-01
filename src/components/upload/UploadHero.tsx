"use client";

import { motion } from "framer-motion";

export default function UploadHero() {
  return (
    <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ev-gold/20 bg-ev-gold/5 text-xs font-mono uppercase tracking-[0.15em] text-ev-gold">
          Career Intelligence Studio
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight text-ev-text"
      >
        Make your resume
        <br />
        <span className="text-ev-gold">impossible to ignore.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ev-text-secondary lg:mx-0"
      >
        Upload one resume to reveal ATS gaps, skill signals, resume
        improvements, and career path matches.
      </motion.p>
    </div>
  );
}
