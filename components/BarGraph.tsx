// components/BarGraph.tsx

import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { CareerPath } from '../types';

interface CompatibilityChartProps {
  paths: CareerPath[];
  selectedRole: string | null;
}

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const pct = payload[0].value as number;
  const quality = pct >= 85 ? 'Excellent' : pct >= 70 ? 'Good' : 'Fair';
  const accent = pct >= 85 ? '#34d399' : pct >= 70 ? '#22d3ee' : '#fb923c';
  
  return (
    <div className="max-w-[260px] rounded-xl border border-white/[0.12] bg-[#0b0b10] px-4 py-3 shadow-[0_18px_35px_rgba(0,0,0,0.45)]">
      <p className="font-bold mb-2 text-light-text truncate max-w-[200px]">{label}</p>
      <div className="flex items-center gap-2.5">
        <span className="text-2xl font-black" style={{ color: accent }}>{pct}%</span>
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: accent }}>{quality} Match</span>
      </div>
    </div>
  );
};

const CompatibilityChart: React.FC<CompatibilityChartProps> = memo(({ paths, selectedRole }) => {
  const sortedData = [...paths].sort((a, b) => b.matchPercentage - a.matchPercentage);

  const textColor = 'rgba(255,255,255,0.55)';
  const gridColor = 'rgba(255,255,255,0.08)';

  const getColor = (entry: CareerPath) => {
    if (entry.role === selectedRole) return '#06b6d4'; // accent-secondary
    if (entry.matchPercentage >= 85) return '#34d399'; // emerald-400
    if (entry.matchPercentage >= 70) return '#a78bfa'; // violet-400
    return '#fb923c'; // orange-400
  };

  const getStroke = (entry: CareerPath) => (entry.role === selectedRole ? 'rgba(255,255,255,0.78)' : 'transparent');

  return (
    <div style={{ width: '100%', height: 400, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          key={`bar-${selectedRole}`}
          data={sortedData}
          margin={{ top: 20, right: 20, left: 10, bottom: 90 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="role"
            stroke={textColor}
            angle={-40}
            textAnchor="end"
            height={110}
            tick={{ fontSize: 11, fill: textColor, fontWeight: 500 }}
            interval={0}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            stroke={textColor}
            tickFormatter={tick => `${tick}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: textColor, fontWeight: 500 }}
            width={48}
          />
          <Tooltip
            cursor={{ fill: 'rgba(6,182,212,0.08)', radius: 6 }}
            content={<GlassTooltip />}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey="matchPercentage" radius={[10, 10, 0, 0]} barSize={26} animationDuration={900} animationEasing="ease-out">
            {sortedData.map(entry => (
              <Cell key={`cell-${entry.role}`} fill={getColor(entry)} stroke={getStroke(entry)} strokeWidth={1.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default CompatibilityChart;