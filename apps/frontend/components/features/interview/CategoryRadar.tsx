// filepath: apps/frontend/components/features/interview/CategoryRadar.tsx

"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface CategoryRadarProps {
  data: Array<{ subject: string; A: number; fullMark: number }>;
}

export default function CategoryRadar({ data }: CategoryRadarProps) {
  if (data.every(d => d.A === 0)) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 min-h-[256px] flex items-center justify-center">
        No category data yet. Complete an interview to see your skill breakdown.
      </div>
    );
  }

  return (
    // ✅ FIX: Explicit height + hidden overflow
    <div className="w-full h-64 min-h-[256px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius="70%" // ✅ Reduce radius to prevent overflow
          data={data}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <PolarGrid stroke="#374151" strokeOpacity={0.5} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "#9CA3AF", fontSize: 10 }}
            stroke="#9CA3AF"
            tickSize={0}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: "#9CA3AF", fontSize: 9 }}
            stroke="#9CA3AF"
            tickCount={5}
          />
          <Radar
            name="Your Score"
            dataKey="A"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}