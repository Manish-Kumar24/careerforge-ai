// apps/frontend/components/features/resume/JDInput.tsx

"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

interface Props {
  onMatch: (jdInput: { text: string; title?: string }) => Promise<void>;
  onError: (message: string) => void;
  disabled?: boolean;
}

export default function JDInput({ onMatch, onError, disabled }: Props) {
  const [jdText, setJdText] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [isMatching, setIsMatching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jdText.trim() || jdText.trim().length < 50) {
      onError("Please paste a valid job description (at least 50 characters)");
      return;
    }

    try {
      setIsMatching(true);
      await onMatch({
        text: jdText.trim(),
        title: jdTitle.trim() || undefined
      });
      setJdText("");
      setJdTitle("");
    } catch (error: any) {
      onError(error.message || "Failed to analyze job description");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Job Title (Optional)
        </label>
        <input
          type="text"
          value={jdTitle}
          onChange={(e) => setJdTitle(e.target.value)}
          placeholder="e.g., Senior Data Scientist"
          disabled={disabled || isMatching}
          className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* JD Text Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Job Description *
        </label>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={12}
          disabled={disabled || isMatching}
          className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-400">
          {jdText.length}/10,000 characters • <span className="text-blue-500">Tip: Copy from any job board</span>
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled || isMatching || !jdText.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                 text-white font-medium rounded-lg transition-colors"
      >
        {isMatching ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing match...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Match with Job Description
          </>
        )}
      </button>
      
      {/* Helpful hint */}
      <p className="text-xs text-gray-400 text-center pt-2">
        Paste the job description text from any career page. URL input is disabled for reliability.
      </p>
    </form>
  );
}