// filepath: apps/frontend/components/features/interview/CategoryRadar.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

interface CategoryRadarProps {
  data: Array<{ subject: string; A: number; fullMark: number }>;
}

export default function CategoryRadar({ data }: CategoryRadarProps) {
  if (typeof window === "undefined") return null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!data || data.length === 0 || data.every(d => d.A === 0)) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[256px] flex items-center justify-center">
        No category data yet.
      </div>
    );
  }

  return (
    <div className="w-full h-[260px] min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Radar dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}