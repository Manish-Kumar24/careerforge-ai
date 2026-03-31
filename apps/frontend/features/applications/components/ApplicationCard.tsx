// D:\Project\ai-interview-tracker\apps\frontend\features\applications\components\ApplicationCard.tsx

"use client";

import { useState } from "react";
import { Application, ApplicationStatus, TimelineEntry } from "@/types/application";
import { useApplicationStore } from "@/features/applications/store";

const statusColor = {
  applied: "bg-gray-400",
  oa: "bg-yellow-500",
  interview: "bg-blue-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
};

const statusIcons = {
  applied: "📝",
  oa: "💻",
  interview: "🎯",
  offer: "🎉",
  rejected: "❌",
};

const typeIcons = {
  created: "📝",
  manual: "💬",
  status_change: "🔄",
  priority_toggle: "⭐",
};

const typeColors = {
  created: "text-blue-600 dark:text-blue-400",
  manual: "text-gray-600 dark:text-gray-400",
  status_change: "text-purple-600 dark:text-purple-400",
  priority_toggle: "text-yellow-600 dark:text-yellow-400",
};

export default function ApplicationCard({ app }: { app: Application }) {
  const { updateStatus, removeApplication, togglePriority, addTimelineNote } = useApplicationStore();
  const [showTimeline, setShowTimeline] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addTimelineNote(app._id, newNote.trim());
      setNewNote("");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    // ✅ Show minutes for recent actions
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };


  return (
    <div className="border p-4 rounded-lg shadow space-y-3">
      {/* ✅ ROW 1: Company + Role + Priority + Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base truncate">
              {app.company}
            </h2>
            {/* ✅ TINY BOOKMARK ICON */}
            <button
              onClick={() => togglePriority(app._id)}  // ✅ Now calls store action (1 param)
              className="text-lg hover:scale-110 transition-transform"
              title={app.isPriority ? "Remove priority" : "Mark as priority"}
            >
              {app.isPriority ? "⭐" : "☆"}
            </button>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {app.role}
          </p>
        </div>

        <span
          className={`text-white px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${statusColor[app.status]
            }`}
        >
          {app.status}
        </span>
      </div>

      {/* ✅ ROW 2: Notes + Actions + Timeline Toggle */}
      <div className="space-y-2">
        {app.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {app.notes}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <select
            onChange={(e) =>
              updateStatus(app._id, e.target.value as ApplicationStatus)
            }
            value={app.status}
            className="w-28 border px-2 py-1.5 rounded bg-white text-black dark:bg-gray-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="applied">📝 Applied</option>
            <option value="interview">🎯 Interview</option>
            <option value="oa">💻 OA</option>
            <option value="offer">🎉 Offer</option>
            <option value="rejected">❌ Rejected</option>
          </select>

          <button
            className="text-blue-500 hover:text-blue-700 text-sm font-medium px-3 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            onClick={() => setShowTimeline(!showTimeline)}
          >
            {showTimeline ? "Hide" : "📋 Timeline"} ({app.timeline?.length || 0})
          </button>

          <button
            className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            onClick={() => removeApplication(app._id)}
          >
            Delete
          </button>
        </div>

        {/* ✅ TIMELINE SECTION (Expandable) */}
        {showTimeline && (
          <div className="border-t pt-3 space-y-2">
            {/* Add Note Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 border px-3 py-1.5 rounded text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Timeline Entries */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {app.timeline && app.timeline.length > 0 ? (
                [...app.timeline]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((entry: TimelineEntry, idx: number) => (
                    <div
                      key={entry._id || idx}
                      className="flex gap-2 text-xs p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                    >
                      <span className="text-lg">{typeIcons[entry.type]}</span>
                      <div className="flex-1">
                        <p className="text-gray-700 dark:text-gray-300">{entry.note}</p>
                        <p className={`text-gray-400 mt-0.5 ${typeColors[entry.type]}`}>
                          {formatTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No timeline entries yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}