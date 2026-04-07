// apps\frontend\components\features\practice\PatternGroup.tsx

"use client";

import { useState, useMemo } from "react";
import { PracticeProblem } from "@/types/practice";
import ProblemRow from "./ProblemRow";

interface PatternGroupProps {
  pattern: string;
  problems: PracticeProblem[];
}

export default function PatternGroup({ pattern, problems }: PatternGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // ✅ Use useMemo to prevent recalculation on every render
  const { completed, inProgress, notStarted, total, percentage } = useMemo(() => {
    const total = problems.length;
    const completed = problems.filter((p) => p.progress?.status === "completed").length;
    const inProgress = problems.filter((p) => p.progress?.status === "in-progress").length;
    const notStarted = problems.filter((p) => 
      !p.progress || p.progress.status === "not-started" || p.progress.status == null
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, inProgress, notStarted, total, percentage };
  }, [problems]);

  return (
    <div className="border rounded-lg overflow-hidden" key={problems.map(p => `${p._id}-${p.progress?.status}`).join('|')}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{isExpanded ? "▼" : "▶"}</span>
          <h3 className="font-semibold text-lg">{pattern}</h3>
          <span className="text-sm text-gray-500">
            ({completed}✓ + {inProgress}◐ + {notStarted}○)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini segmented bar */}
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-gray-400 dark:bg-gray-600 transition-all duration-300"
              style={{ width: `${total > 0 ? (notStarted / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
        </div>
      </button>

      {/* Problems */}
      {isExpanded && (
        <div className="divide-y">
          {problems.map((problem) => (
            <ProblemRow key={problem._id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
}