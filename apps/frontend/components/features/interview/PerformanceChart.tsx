// filepath: apps/frontend/components/features/interview/PerformanceChart.tsx

"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface PerformanceChartProps {
  data: Array<{ date: string; score: number; sessions: number }>;
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (typeof window === "undefined") return null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[256px] flex items-center justify-center">
        No performance data yet.
      </div>
    );
  }

  return (
    <div className="w-full h-[260px] min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#3B82F6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}