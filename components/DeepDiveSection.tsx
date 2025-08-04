import React from 'react';
import { motion } from 'framer-motion';
import type { CareerPath } from '../types';
import ProficiencyRadarChart from './RadarChartComponent';
import { LightbulbIcon, ThumbsUpIcon, SkillDevelopIcon, RadarIcon } from './icons';

const DeepDiveSection = ({ path }: { path: CareerPath }) => {
    const getUniqueSkills = (skills: { name: string }[] | undefined) => {
        if (!skills) return [];
        const seen = new Set();
        return skills.filter(skill => {
            if (!skill || !skill.name) return false;
            const duplicate = seen.has(skill.name);
            seen.add(skill.name);
            return !duplicate;
        });
    };
    
    const uniqueRelevantSkills = getUniqueSkills(path.relevantSkills);
    const uniqueSkillsToDevelop = getUniqueSkills(path.skillsToDevelop);

    const hasRelevantSkills = uniqueRelevantSkills.length > 0;
    const hasSkillsToDevelop = uniqueSkillsToDevelop.length > 0;
    const hasProficiencyAnalysis = path.skillProficiencyAnalysis && path.skillProficiencyAnalysis.length > 0;

    return (
        <motion.div 
            key={path.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
            layout
        >
            <div className="space-y-8 rounded-2xl">
                <div className="flex items-start gap-4">
                    <LightbulbIcon className="w-8 h-8 text-violet-500 dark:text-violet-400 mt-1 shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold font-sans text-gray-900 dark:text-light-text">Deep Dive: <span className="text-violet-600 dark:text-violet-300">{path.role}</span></h3>
                        <p className="text-gray-600 dark:text-subtle-text mt-1">{path.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ✅ FIXED: Applied new glassmorphism style to the "Relevant Skills" card. */}
                    <div className="bg-white/50 dark:bg-transparent p-6 rounded-2xl border border-brand-purple/50 dark:border-neutral-700 min-h-[150px] shadow-glow">
                        <h4 className="flex items-center gap-3 mb-4 text-lg font-bold text-gray-800 dark:text-light-text"><ThumbsUpIcon className="w-5 h-5 text-green-500 dark:text-green-400"/>Relevant Skills</h4>
                        {hasRelevantSkills ? (
                            <div className="flex flex-wrap gap-2">
                                {uniqueRelevantSkills.map((skill) => (
                                    <span key={skill.name} className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300 text-sm font-medium px-3 py-1.5 rounded-full">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-subtle-text italic">No specific relevant skills were identified.</p>
                        )}
                    </div>

                    {/* ✅ FIXED: Applied new glassmorphism style to the "Skills to Develop" card. */}
                    <div className="bg-white/50 dark:bg-transparent p-6 rounded-2xl border border-brand-purple/50 dark:border-neutral-700 min-h-[150px] shadow-glow">
                        <h4 className="flex items-center gap-3 mb-4 text-lg font-bold text-gray-800 dark:text-light-text"><SkillDevelopIcon className="w-5 h-5 text-sky-500 dark:text-sky-400"/>Skills to Develop</h4>
                        {hasSkillsToDevelop ? (
                            <div className="flex flex-wrap gap-2">
                                {uniqueSkillsToDevelop.map((skill) => (
                                    <span key={skill.name} className="bg-sky-100 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 text-sm font-medium px-3 py-1.5 rounded-full">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-subtle-text italic">No specific skills to develop were identified.</p>
                        )}
                    </div>
                </div>

                {hasProficiencyAnalysis && (
                    // ✅ FIXED: Applied new glassmorphism style to the "Skill Proficiency Gap" card.
                    <div className="bg-white/50 dark:bg-transparent p-6 rounded-2xl border border-brand-purple/50 dark:border-neutral-700 shadow-glow">
                        <div className="flex items-center gap-3 mb-3">
                            <RadarIcon className="w-6 h-6 text-violet-500 dark:text-violet-400" />
                            <h4 className="text-xl font-bold text-gray-800 dark:text-light-text">Skill Proficiency Gap</h4>
                        </div>
                        <div className="w-full" style={{ height: '400px' }}>
                            <ProficiencyRadarChart skills={path.skillProficiencyAnalysis} />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DeepDiveSection;