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
                <div className="flex items-start gap-5">
                    <div className="rounded-xl border border-white/[0.08] p-3 bg-black/30 shadow-sm mt-1">
                        <LightbulbIcon className="h-6 w-6 shrink-0 text-accent-secondary" />
                    </div>
                    <div>
                        <h3 className="font-display text-2xl font-bold text-light-text">
                            Deep Dive: <span className="text-accent-primary">{path.role}</span>
                        </h3>
                        <p className="mt-2 text-[15px] font-medium text-light-text leading-relaxed">{path.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black/40 rounded-2xl border border-white/[0.08] min-h-[150px] p-8 transition-all duration-300 hover:border-accent-secondary/30">
                        <h4 className="mb-5 flex items-center gap-3 font-display text-lg font-bold text-light-text">
                            <ThumbsUpIcon className="h-5 w-5 text-emerald-400"/> Relevant Skills
                        </h4>
                        {hasRelevantSkills ? (
                            <div className="flex flex-wrap gap-2.5">
                                {uniqueRelevantSkills.map((skill) => (
                                    <span key={skill.name} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase text-emerald-300">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="italic text-light-text opacity-70">No specific relevant skills were identified.</p>
                        )}
                    </div>

                    <div className="bg-black/40 rounded-2xl border border-white/[0.08] min-h-[150px] p-8 transition-all duration-300 hover:border-accent-secondary/30">
                        <h4 className="mb-5 flex items-center gap-3 font-display text-lg font-bold text-light-text">
                            <SkillDevelopIcon className="h-5 w-5 text-accent-secondary"/> Skills to Develop
                        </h4>
                        {hasSkillsToDevelop ? (
                            <div className="flex flex-wrap gap-2.5">
                                {uniqueSkillsToDevelop.map((skill) => (
                                    <span key={skill.name} className="rounded-full border border-accent-secondary/20 bg-accent-secondary/10 px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase text-accent-secondary">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="italic text-light-text opacity-70">No specific skills to develop were identified.</p>
                        )}
                    </div>
                </div>

                {hasProficiencyAnalysis && (
                    <div className="bg-black/45 rounded-3xl border border-white/[0.08] p-8 sm:p-10 relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-4 mb-8">
                            <div className="rounded-xl border border-white/[0.08] p-2.5 bg-black/30 shadow-inner">
                                <RadarIcon className="h-6 w-6 text-accent-primary" />
                            </div>
                            <h4 className="font-display text-2xl font-bold text-light-text">Skill Proficiency Gap</h4>
                        </div>
                        <div className="w-full relative z-10" style={{ height: '450px' }}>
                            <ProficiencyRadarChart skills={path.skillProficiencyAnalysis} />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DeepDiveSection;