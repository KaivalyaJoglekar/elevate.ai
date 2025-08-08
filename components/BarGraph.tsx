// src/components/BarGraph.tsx

import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { CareerPath } from '../types';
import { useTheme } from '../hooks/useTheme';

interface CompatibilityChartProps {
  paths: CareerPath[];
  selectedRole: string | null;
}

const CompatibilityChart: React.FC<CompatibilityChartProps> = memo(({ paths, selectedRole }) => {
  const { theme } = useTheme();
  const sortedData = [...paths].sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  const topMatchColor = '#facc15'; // yellow-400
  const defaultColor = '#8b5cf6'; // violet-500

  const textColor = theme === 'dark' ? '#E5E7EB' : '#1f2937';
  const gridColor = theme === 'dark' ? '#262626' : '#e5e7eb';
  const tooltipBg = theme === 'dark' ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const tooltipBorder = theme === 'dark' ? '#2D2D2D' : '#e5e7eb';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg border backdrop-blur-sm"
          style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder}}
        >
          <p className="font-bold text-gray-800 dark:text-light-text">{label}</p>
          <p className="text-violet-500 dark:text-violet-400">{`Match Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        key={`barchart-${selectedRole}`}
        data={sortedData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
        <XAxis 
            dataKey="role"
            stroke={textColor}
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{fontSize: 12, fill: textColor}}
            interval={0}
        />
        <YAxis
          type="number" 
          domain={[0, 100]} 
          stroke={textColor} 
          tickFormatter={(tick) => `${tick}%`}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
          content={<CustomTooltip />}
        />
        <Bar dataKey="matchPercentage" radius={[4, 4, 0, 0]} barSize={25} animationDuration={800}>
           {sortedData.map((entry) => (
            <Cell key={`cell-${entry.role}`} fill={entry.role === selectedRole ? topMatchColor : defaultColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

export default CompatibilityChart;