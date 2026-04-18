// filepath: apps/frontend/components/features/interview/PerformanceChart.tsx

"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  data: Array<{ date: string; score: number; sessions: number }>;
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 min-h-[256px] flex items-center justify-center">
        No performance data yet. Complete an interview to see your trend.
      </div>
    );
  }

  return (
    // ✅ FIX: Explicit height + hidden overflow to contain chart
    <div className="w-full h-64 min-h-[256px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 10, right: 20, bottom: 5, left: 0 }} // ✅ Add margin to prevent axis cutoff
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF" 
            fontSize={11} 
            tick={{ fill: "#9CA3AF" }}
            interval={0} // ✅ Show all ticks or use "preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#9CA3AF" 
            fontSize={11}
            tick={{ fill: "#9CA3AF" }}
            width={30} // ✅ Prevent Y-axis label cutoff
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#1F2937", 
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
              fontSize: "12px"
            }}
            labelStyle={{ color: "#9CA3AF" }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: "#3B82F6", strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: "#60A5FA", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}