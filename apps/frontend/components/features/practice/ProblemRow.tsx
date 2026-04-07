// apps\frontend\components\features\practice\ProblemRow.tsx

"use client";

import { PracticeProblem } from "@/types/practice";
import { usePracticeStore } from "@/features/practice/store";
import { useState } from "react";
import NotesModal from "./NotesModal";
import TimerButton from "./TimerButton";
import { toggleProblemBookmark } from "@/features/practice/api";
import PlatformIcon from "./PlatformIcon";
import CompanyTags from "./CompanyTags";

interface ProblemRowProps {
  problem: PracticeProblem;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const platformIcons = {
  leetcode: "🟩",
  geeksforgeeks: "🟦",
};

export default function ProblemRow({ problem }: ProblemRowProps) {
  const { updateProblemProgress } = usePracticeStore();
  const [showNotes, setShowNotes] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const [localBookmarked, setLocalBookmarked] = useState(problem.progress?.isBookmarked ?? false);

  const status = problem.progress?.status || "not-started";

  const handleStatusToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const nextStatus =
        status === "not-started" ? "in-progress" :
          status === "in-progress" ? "completed" :
            "not-started";
      await updateProblemProgress(problem._id, { status: nextStatus });
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);

    // Optimistic UI update
    const newBookmarked = !localBookmarked;
    setLocalBookmarked(newBookmarked);

    try {
      await toggleProblemBookmark(problem._id);
      // ✅ FIX: Re-fetch WITH current filters to preserve UI state
      const store = usePracticeStore.getState();
      await store.fetchProblems(store.currentFilters);
    } catch (err) {
      // Revert on error
      setLocalBookmarked(!newBookmarked);
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleOpenLink = async () => {
    if (status !== "completed" && status !== "in-progress") {
      await updateProblemProgress(problem._id, { status: "in-progress" });
    }
    window.open(problem.link, "_blank");
  };

  const isBookmarked = localBookmarked ?? problem.progress?.isBookmarked ?? false;

  return (
    <>
      <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

        {/* Status Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusToggle}
            disabled={isToggling}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${status === "completed"
              ? "bg-green-500 border-green-500 text-white"
              : status === "in-progress"
                ? "bg-yellow-400 border-yellow-400 text-gray-900"
                : "bg-transparent border-gray-400 hover:border-blue-500"
              }`}
            title={
              status === "not-started"
                ? "Not Started"
                : status === "in-progress"
                  ? "In Progress"
                  : "Completed"
            }
            aria-label={`Status: ${status.replace("-", " ")}`}
          >
            {status === "completed" && "✓"}
            {status === "in-progress" && "◐"}
          </button>
        </div>

        {/* Problem Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{problem.title}</h4>
            {/* <span className="text-lg">{platformIcons[problem.platform]}</span> */}
            <PlatformIcon tags={problem.tags} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <CompanyTags companies={problem.companies} maxVisible={3} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <TimerButton
            problemId={problem._id}
            difficulty={problem.difficulty}
            compact={true}
          />

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            disabled={isBookmarking}
            className={`text-lg transition-transform hover:scale-110 disabled:opacity-50 ${isBookmarked
              ? "text-yellow-500"
              : "text-gray-400 hover:text-yellow-500"
              }`}
            title={isBookmarked ? "Remove from bookmarks" : "Bookmark for revision"}
          >
            {isBookmarked ? "⭐" : "☆"}
          </button>

          <button
            onClick={() => setShowNotes(true)}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Add notes"
            disabled={isToggling}
          >
            📝 Notes
          </button>
          <button
            onClick={handleOpenLink}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
            disabled={isToggling}
          >
            🔗 Solve
          </button>
        </div>
      </div>

      {showNotes && <NotesModal problem={problem} onClose={() => setShowNotes(false)} />}
    </>
  );
}