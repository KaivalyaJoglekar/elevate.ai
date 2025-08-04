import React from 'react';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { SkillProficiency } from '../types';
import { useTheme } from '../hooks/useTheme';

interface ProficiencyRadarChartProps {
  skills: SkillProficiency[];
}

const ProficiencyRadarChart: React.FC<ProficiencyRadarChartProps> = ({ skills }) => {
  const { theme } = useTheme();
  const chartData = skills.map(s => ({
    subject: s.skill,
    user: s.userProficiency,
    required: s.requiredProficiency,
    fullMark: 100
  }));
  
  const textColor = theme === 'dark' ? '#9CA3AF' : '#4b5563';
  // ✅ FIXED: Grid color for light theme is now a much darker grey for visibility
  const gridColor = theme === 'dark' ? '#374151' : '#9CA3AF';
  const tooltipBg = theme === 'dark' ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const tooltipBorder = theme === 'dark' ? '#2D2D2D' : '#e5e7eb';

  // Define colors from brand
  const userColor = '#8B5CF6'; // brand-purple
  const requiredColor = '#60A5FA'; // brand-blue

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { subject } = payload[0].payload;
      return (
        <div 
          className="p-3 rounded-lg border backdrop-blur-sm shadow-lg text-sm"
          style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder}}
        >
          <p className="font-bold text-gray-800 dark:text-light-text mb-2">{subject}</p>
          {payload.map((pld: any) => (
             <p key={pld.name} style={{ color: pld.color }}>
                {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <defs>
            <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={userColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={userColor} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="requiredGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={requiredColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={requiredColor} stopOpacity={0.05}/>
            </linearGradient>
        </defs>
        <PolarGrid gridType="circle" stroke={gridColor} strokeDasharray="3 3" />
        <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: textColor, fontSize: 13, fontWeight: 500 }} 
            tickLine={false}
            style={{ transform: 'translateY(-5px)' }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeDasharray: '4 4' }} />
        <Legend 
            wrapperStyle={{ paddingTop: '25px' }} 
            formatter={(value) => <span style={{ color: textColor, marginLeft: '4px' }}>{value}</span>}
        />
        <Radar 
            name="Your Proficiency" 
            dataKey="user" 
            stroke={userColor} 
            fill="url(#userGradient)" 
            fillOpacity={1} 
            strokeWidth={2}
            animationDuration={1200}
            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: userColor }}
        />
        <Radar 
            name="Required Proficiency" 
            dataKey="required" 
            stroke={requiredColor} 
            fill="url(#requiredGradient)" 
            fillOpacity={1} 
            strokeWidth={2}
            strokeDasharray="4 4"
            animationDuration={1200}
            activeDot={{ r: 4, strokeWidth: 0, fill: requiredColor }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default ProficiencyRadarChart;