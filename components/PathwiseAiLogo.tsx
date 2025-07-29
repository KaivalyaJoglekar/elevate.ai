import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AppLogo = () => (
    <Link to="/" className="flex items-center gap-2 group">
        <motion.div 
            className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center"
            whileHover={{ scale: 1.15, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
            </svg>
        </motion.div>
        <span className="font-bold text-xl text-gray-800 dark:text-light-text">Elevate.ai</span>
    </Link>
);