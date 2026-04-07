"use client";

import { useState } from "react";
import { PracticeProblem } from "@/types/practice";
import { usePracticeStore } from "@/features/practice/store";

interface NotesModalProps {
  problem: PracticeProblem;
  onClose: () => void;
}

export default function NotesModal({ problem, onClose }: NotesModalProps) {
  const { updateProblemProgress } = usePracticeStore();
  
  const [notes, setNotes] = useState(problem.progress?.notes ?? "");
  const [attempts, setAttempts] = useState(problem.progress?.attempts ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // ✅ FIX: Await store update which includes re-fetch
      await updateProblemProgress(problem._id, { notes, attempts });
      // ✅ FIX: Close modal AFTER store update completes
      onClose();
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-lg p-6 space-y-4">
        <h3 className="text-xl font-bold">{problem.title}</h3>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your approach, hints, or learnings..."
            className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Attempts</label>
          <input
            type="number"
            value={attempts}
            onChange={(e) => setAttempts(Number(e.target.value))}
            min="0"
            className="w-full border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}