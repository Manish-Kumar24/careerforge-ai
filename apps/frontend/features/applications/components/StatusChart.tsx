// apps\frontend\features\applications\components\StatusChart.tsx

"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

const COLORS = ["#3b82f6", "#facc15", "#22c55e", "#ef4444", "#a78bfa"];

export default function StatusChart({ data }: Props) {
  // ✅ Focus state: null = all equal, string = highlight this one
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  const safeData = data
    .map(d => ({
      name: d.name,
      value: Number(d.value) || 0
    }))
    .filter(d => d.value > 0);

  const total = safeData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <p className="text-center text-gray-500 text-sm">No valid data</p>;
  }

  // ✅ Toggle focus: click same item again to reset
  const handleLegendClick = (entry: any) => {
    const { value } = entry;
    setFocusedItem(prev => (prev === value ? null : value));
  };

  // Custom label formatter: show value + percentage on slice
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, name } = props;

    // Defensive checks for NaN
    if (
      cx == null || cy == null || midAngle == null ||
      innerRadius == null || outerRadius == null ||
      isNaN(cx) || isNaN(cy) || isNaN(midAngle)
    ) {
      return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const rad = (Math.PI / 180) * (midAngle - 90);
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);
    
    const percent = total > 0 ? ((Number(value) || 0) / total * 100).toFixed(0) : "0";

    // Only show label if slice is big enough
    if (Number(percent) < 5 || isNaN(x) || isNaN(y)) return null;

    // ✅ Dim label if not focused (when focus is active)
    const isFocused = focusedItem === null || focusedItem === name;
    
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`font-semibold drop-shadow-sm pointer-events-none select-none transition-opacity duration-200 ${
          isFocused 
            ? 'fill-white text-[10px]' 
            : 'fill-white/60 text-[9px]'
        }`}
      >
        {value}
        <tspan className={isFocused ? 'text-[9px] opacity-90' : 'text-[8px] opacity-70'}>
          ({percent}%)
        </tspan>
      </text>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <PieChart width={360} height={280}>
        <Pie
          data={safeData}
          dataKey="value"
          nameKey="name"
          cx="42%"
          cy="50%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={2}
          isAnimationActive={false}
          stroke="none"
        >
          {safeData.map((entry, index) => {
            const isFocused = focusedItem === null || focusedItem === entry.name;
            
            return (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
                // ✅ FOCUS EFFECT: pop out + white border + brightness
                stroke={isFocused ? "#ffffff" : "transparent"}
                strokeWidth={isFocused ? 3 : 1}
                opacity={isFocused ? 1 : 0.4}
                className="transition-all duration-300 ease-in-out cursor-pointer hover:opacity-90"
                // Optional: also allow clicking the slice itself to focus
                onClick={() => setFocusedItem(prev => 
                  prev === entry.name ? null : entry.name
                )}
              />
            );
          })}
          
          {safeData.length > 0 && <LabelList content={renderCustomLabel} />}
        </Pie>

        <Tooltip
          contentStyle={{
            fontSize: '11px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          formatter={(value: number) => [`${value} (${total > 0 ? ((value/total)*100).toFixed(0) : 0}%)`, 'Count']}
        />

        {/* ✅ Interactive Legend: click to focus */}
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={9}
          wrapperStyle={{
            top: '50%',
            transform: 'translateY(-50%)',
            right: 8,
            fontSize: '11px',
            color: '#4b5563',
            lineHeight: '1.6',
          }}
          onClick={handleLegendClick}
          formatter={(value, entry: any) => {
            const isFocused = focusedItem === null || focusedItem === value;
            const count = entry?.payload?.value ?? entry?.value ?? 0;
            
            return (
              <span
                className={`transition-all duration-200 cursor-pointer select-none flex items-center gap-1 ${
                  isFocused
                    ? 'text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title={isFocused ? 'Click to reset view' : `Click to focus on ${value}`}
              >
                {/* ✅ Visual indicator for focused state */}
                {focusedItem !== null && (
                  <span className={`w-2 h-2 rounded-full ${isFocused ? 'bg-blue-500 animate-pulse' : 'bg-transparent'}`} />
                )}
                {value} <span className="text-gray-500 ml-0.5">({count})</span>
              </span>
            );
          }}
        />
      </PieChart>
    </div>
  );
}