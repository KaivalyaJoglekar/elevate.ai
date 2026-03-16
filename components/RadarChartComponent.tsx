// components/RadarChartComponent.tsx

import React from 'react';
import {
  Radar, RadarChart, PolarGrid, Legend,
  PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { SkillProficiency } from '../types';

interface ProficiencyRadarChartProps {
  skills: SkillProficiency[];
}

const GlassTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { subject } = payload[0].payload;
  return (
    <div className="px-5 py-4 rounded-2xl border border-white/10 glass bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl min-w-[170px]">
      <p className="font-bold mb-3 text-light-text tracking-wide">{subject}</p>
      {payload.map((pld: any) => (
        <div key={pld.name} className="flex items-center justify-between gap-5 mb-2 last:mb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pld.color, boxShadow: `0 0 8px ${pld.color}80` }} />
            <span className="text-xs font-semibold text-slate-300">{pld.name}</span>
          </div>
          <span className="text-sm font-black drop-shadow-sm" style={{ color: pld.color }}>{pld.value}</span>
        </div>
      ))}
    </div>
  );
};

const ProficiencyRadarChart: React.FC<ProficiencyRadarChartProps> = ({ skills }) => {
  const chartData = skills.map(s => ({
    subject: s.skill,
    user: s.userProficiency,
    required: s.requiredProficiency,
    fullMark: 100,
  }));

  const textColor = 'rgba(255,255,255,0.4)';
  const gridColor = 'rgba(255,255,255,0.05)';
  const userColor = '#8b5cf6'; // accent-primary (violet-500)
  const reqColor = '#475569'; // slate-600

  return (
    <div style={{ width: '100%', height: 400, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <defs>
            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={userColor} stopOpacity={0.6} />
              <stop offset="95%" stopColor={userColor} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={reqColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={reqColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <PolarGrid gridType="polygon" stroke={gridColor} strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: textColor, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}
            tickLine={false}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

          <Tooltip
            content={<GlassTooltip />}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={value => (
              <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 6, fontSize: 12, fontWeight: 500 }}>{value}</span>
            )}
          />

          <Radar
            name="Your Proficiency"
            dataKey="user"
            stroke={userColor}
            fill="url(#userGrad)"
            fillOpacity={1}
            strokeWidth={2.5}
            animationDuration={1200}
            dot={{ fill: userColor, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: userColor }}
          />
          <Radar
            name="Required Proficiency"
            dataKey="required"
            stroke={reqColor}
            fill="url(#reqGrad)"
            fillOpacity={1}
            strokeWidth={2}
            strokeDasharray="4 4"
            animationDuration={1200}
            dot={{ fill: reqColor, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: reqColor }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProficiencyRadarChart;