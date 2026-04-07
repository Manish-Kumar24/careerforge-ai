// apps\frontend\components\features\practice\TimerButton.tsx

"use client";

import { useState, useEffect } from "react";
import { useProblemTimer } from "@/hooks/useProblemTimer";
import { startProblemTimer, toggleProblemTimer, resetProblemTimer } from "@/features/practice/api";

interface TimerButtonProps {
  problemId: string;
  difficulty: "easy" | "medium" | "hard";
  onTimerComplete?: () => void;
  compact?: boolean;
}

export default function TimerButton({
  problemId,
  difficulty,
  onTimerComplete,
  compact = false
}: TimerButtonProps) {
  const {
    remainingSeconds,
    isRunning,
    isExpired,
    formattedTime,
    colorClass,
    fetchTimer,
    isLoading: timerLoading,
  } = useProblemTimer(problemId);

  const [actionLoading, setActionLoading] = useState(false);
  const [localExpired, setLocalExpired] = useState(false);

  // Sync local expired state with hook
  useEffect(() => {
    if (isExpired) {
      setLocalExpired(true);
    }
  }, [isExpired]);

  // Get default target time based on difficulty
  const getDefaultTarget = () => {
    if (difficulty === "easy") return 900;   // 15 min
    if (difficulty === "hard") return 2700;  // 45 min
    return 1800; // 30 min (medium)
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await startProblemTimer(problemId, getDefaultTarget());
      await fetchTimer();
      setLocalExpired(false);
      onTimerComplete?.();
    } catch (err) {
      console.error("Failed to start timer:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async () => {
    // If expired, treat as reset + start
    if (localExpired) {
      await handleReset();
      return;
    }

    // If no timer exists yet, start it
    if (!isRunning && remainingSeconds === null) {
      await handleStart();
      return;
    }

    setActionLoading(true);
    try {
      await toggleProblemTimer(problemId);
      await fetchTimer();
    } catch (err) {
      console.error("Failed to toggle timer:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    try {
      await resetProblemTimer(problemId);
      await fetchTimer();
      setLocalExpired(false);
    } catch (err) {
      console.error("Failed to reset timer:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const isDisabled = actionLoading || timerLoading;

  // Compact mode (for table rows)
  if (compact) {
    // ✅ EXPIRED STATE - Show Reset button
    if (localExpired || (remainingSeconds !== null && remainingSeconds <= 0)) {
      return (
        <button
          onClick={handleReset}
          disabled={isDisabled}
          className={`text-xs font-mono px-2 py-1 rounded border ${colorClass} border-current hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 cursor-pointer transition-colors`}
          title="Time's up! Click to reset"
        >
          ⏰ {formattedTime}
        </button>
      );
    }

    // ✅ ACTIVE/PAUSED TIMER - Show time + Pause/Resume + Reset
    if (remainingSeconds !== null) {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggle}
            disabled={isDisabled}
            className={`text-xs font-mono px-2 py-1 rounded border ${colorClass} border-current hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 cursor-pointer transition-colors`}
            title={isRunning ? "Pause timer" : "Resume timer"}
          >
            {isRunning ? "⏱️" : "⏸️"} {formattedTime}
          </button>
          {/* ✅ Reset button for compact mode */}
          <button
            onClick={handleReset}
            disabled={isDisabled}
            className="text-xs px-1.5 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors"
            title="Reset timer"
          >
            ↺
          </button>
        </div>
      );
    }

    // ✅ NOT STARTED - Show Start button
    return (
      <button
        onClick={handleStart}
        disabled={isDisabled}
        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
        title={`Start ${difficulty} timer (${Math.floor(getDefaultTarget() / 60)} min)`}
      >
        🎯 {Math.floor(getDefaultTarget() / 60)}m
      </button>
    );
  }

  // Full mode (for cards)
  // ✅ EXPIRED STATE
  if (localExpired || (remainingSeconds !== null && remainingSeconds <= 0)) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono ${colorClass}`}>⏰ {formattedTime}</span>
        <button
          onClick={handleReset}
          disabled={isDisabled}
          className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Reset
        </button>
      </div>
    );
  }

  // ✅ ACTIVE/PAUSED TIMER
  if (remainingSeconds !== null) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono ${colorClass}`}>
          {isRunning ? "⏱️" : "⏸️"} {formattedTime}
        </span>
        <button
          onClick={handleToggle}
          disabled={isDisabled}
          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button
          onClick={handleReset}
          disabled={isDisabled}
          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Reset
        </button>
      </div>
    );
  }

  // ✅ NOT STARTED
  return (
    <button
      onClick={handleStart}
      disabled={isDisabled}
      className="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
      title={`Start ${difficulty} timer (${Math.floor(getDefaultTarget() / 60)} min)`}
    >
      🎯 Start Timer ({Math.floor(getDefaultTarget() / 60)}m)
    </button>
  );
}