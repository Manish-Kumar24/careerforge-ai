// apps\frontend\components\features\practice\ProgressBar.tsx

"use client";

import { ProgressSummary } from "@/types/practice";

interface ProgressBarProps {
  summary: ProgressSummary;
}

export default function ProgressBar({ summary }: ProgressBarProps) {
  // Calculate segment widths for visual bar
  const completedWidth = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0;
  const inProgressWidth = summary.total > 0 ? (summary.inProgress / summary.total) * 100 : 0;
  const notStartedWidth = 100 - completedWidth - inProgressWidth;

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Your Progress</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {summary.completed} of {summary.total} problems completed
          </p>
        </div>

        {/* ✅ Three-Segment Progress Bar */}
        <div className="flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{summary.percentage}% Complete</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {summary.notStarted} remaining
            </span>
          </div>
          
          {/* Segmented Bar */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {/* Completed - Green */}
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${completedWidth}%` }}
              title={`${summary.completed} completed`}
            />
            {/* In Progress - Yellow */}
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${inProgressWidth}%` }}
              title={`${summary.inProgress} in progress`}
            />
            {/* Not Started - Gray */}
            <div
              className="h-full bg-gray-400 dark:bg-gray-600 transition-all duration-500"
              style={{ width: `${notStartedWidth}%` }}
              title={`${summary.notStarted} not started`}
            />
          </div>
          
          {/* Legend */}
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Completed ({summary.completed})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-gray-600 dark:text-gray-400">In Progress ({summary.inProgress})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Remaining ({summary.notStarted})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}