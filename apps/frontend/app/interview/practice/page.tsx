// filepath: apps/frontend/app/interview/practice/page.tsx

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { interviewApi } from "@/features/interview/api";

export default function PracticeConfig() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ UPDATED FORM STATE (merged)
  const [form, setForm] = useState({
    type: "DSA",
    difficulty: "MEDIUM",
    durationMinutes: 45,
    companyTag: "",
    resumeText: "",
    jdText: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { sessionId, firstQuestion, startTime, durationMinutes } =
        await interviewApi.startPractice({
          type: form.type,
          difficulty: form.difficulty,
          durationMinutes: form.durationMinutes,
          companyTag: form.companyTag,
          resumeText: form.resumeText.slice(0, 5000), // ✅ safety
          jdText: form.jdText.slice(0, 5000)
        });

      // ✅ Store session data
      sessionStorage.setItem(
        `session_${sessionId}`,
        JSON.stringify({
          firstQuestion,
          startTime,
          durationMinutes
        })
      );

      router.push(`/interview/session/${sessionId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Start Quick Practice
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border"
      >
        <div className="space-y-4">
          {/* TYPE + DIFFICULTY */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {[
                  "DSA",
                  "AI_ML",
                  "SYSTEM_DESIGN",
                  "BEHAVIORAL",
                  "ROLE_SPECIFIC"
                ].map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " / ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {["EASY", "MEDIUM", "HARD"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DURATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <select
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  durationMinutes: Number(e.target.value)
                })
              }
              className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              {[30, 45, 60].map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>

          {/* COMPANY TAG */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company Tag (Optional)
            </label>
            <input
              type="text"
              value={form.companyTag}
              onChange={(e) =>
                setForm({ ...form, companyTag: e.target.value })
              }
              placeholder="e.g., Meta, Google"
              className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* ✅ RESUME TEXT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resume Text (Optional)
            </label>
            <textarea
              value={form.resumeText}
              onChange={(e) => setForm({ ...form, resumeText: e.target.value })}
              placeholder="Paste your resume text here for personalized questions..."
              rows={4}
              className="w-full p-2.5 border rounded-lg 
             bg-white dark:bg-gray-800 
             text-gray-900 dark:text-gray-100 
             border-gray-300 dark:border-gray-600 
             font-mono text-sm 
             placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Max 5000 characters. Used only for AI context, never stored.
            </p>
          </div>

          {/* ✅ JD TEXT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Description (Optional)
            </label>
            <textarea
              value={form.jdText}
              onChange={(e) => setForm({ ...form, jdText: e.target.value })}
              placeholder="Paste target job description for role-specific tailoring..."
              rows={4}
              className="w-full p-2.5 border rounded-lg 
             bg-white dark:bg-gray-800 
             text-gray-900 dark:text-gray-100 
             border-gray-300 dark:border-gray-600 
             font-mono text-sm 
             placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Max 5000 characters. Used only for AI context, never stored.
            </p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? "Starting..." : "Begin Practice Session"}
        </button>
      </form>
    </div>
  );
}