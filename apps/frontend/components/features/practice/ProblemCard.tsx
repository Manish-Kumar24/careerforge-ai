// apps\frontend\components\features\practice\ProblemCard.tsx

"use client";

import { PracticeProblem } from "@/types/practice";
import { usePracticeStore } from "@/features/practice/store";
import { useState } from "react";
import NotesModal from "./NotesModal";
import TimerButton from "./TimerButton";
import { toggleProblemBookmark } from "@/features/practice/api";
import PlatformIcon from "./PlatformIcon";
import CompanyTags from "./CompanyTags";

interface ProblemCardProps {
  problem: PracticeProblem;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function ProblemCard({ problem }: ProblemCardProps) {
  const { updateProblemProgress } = usePracticeStore();
  const [showNotes, setShowNotes] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

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
    try {
      await toggleProblemBookmark(problem._id);
      await usePracticeStore.getState().fetchProblems();
    } catch (err) {
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

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold line-clamp-2">{problem.title}</h4>
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

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-1 rounded ${difficultyColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <PlatformIcon tags={problem.tags} />
        </div>

        {/* Companies */}
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <CompanyTags companies={problem.companies} maxVisible={3} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t flex-wrap">
          {/* Timer Button */}
          <TimerButton
            problemId={problem._id}
            difficulty={problem.difficulty}
            compact={false}
          />

          {/* ✅ Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            disabled={isBookmarking}
            className={`text-xl transition-transform hover:scale-110 disabled:opacity-50 ${problem.progress?.isBookmarked
                ? "text-yellow-500"
                : "text-gray-400 hover:text-yellow-500"
              }`}
            title={problem.progress?.isBookmarked ? "Remove from bookmarks" : "Bookmark for revision"}
          >
            {problem.progress?.isBookmarked ? "⭐" : "☆"}
          </button>

          <button
            onClick={() => setShowNotes(true)}
            className="flex-1 min-w-[100px] px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            disabled={isToggling}
          >
            📝 Notes
          </button>
          <button
            onClick={handleOpenLink}
            className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
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