// apps\frontend\features\applications\components\ApplicationModal.tsx

"use client";

import { useState } from "react";
import { ApplicationStatus } from "@/types/application";
import { useApplicationStore } from "@/features/applications/store";

export default function ApplicationModal() {
  const { addApplication, applications } = useApplicationStore();

  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "applied" as ApplicationStatus,
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);

    const companyTrimmed = form.company.trim().toLowerCase();
    const roleTrimmed = form.role.trim().toLowerCase();

    if (!companyTrimmed || !roleTrimmed) {
      setError("Company and role are required");
      setLoading(false);
      return;
    }

    const isDuplicate = applications.some(
      (app) =>
        app.company.trim().toLowerCase() === companyTrimmed &&
        app.role.trim().toLowerCase() === roleTrimmed
    );

    if (isDuplicate) {
      setError(`You already have an application for ${form.company} - ${form.role}`);
      setLoading(false);
      return;
    }

    try {
      await addApplication({
        ...form,
        company: form.company.trim(),
        role: form.role.trim(),
      });

      setForm({
        company: "",
        role: "",
        status: "applied",
        notes: "",
      });
      setError(null);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError(err.response.data.message || "Duplicate application found");
      } else {
        setError("Failed to create application. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg space-y-3">
      {/* ✅ Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* ✅ ROW 1: Company + Role + Status (side-by-side) */}
      <div className="grid grid-cols-3 gap-3">
        <input
          placeholder="Company *"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="border px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={loading}
        />
        
        <input
          placeholder="Role *"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={loading}
        />

        <select
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as ApplicationStatus })
          }
          value={form.status}
          className="border px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={loading}
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="oa">OA</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* ✅ ROW 2: Notes (full width) */}
      <textarea
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="w-full border px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
        rows={2}
        disabled={loading}
      />

      {/* ✅ Submit Button */}
      <button
        onClick={submit}
        disabled={loading}
        className={`w-full px-4 py-2 rounded font-medium transition-colors text-sm ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Adding...' : 'Add Application'}
      </button>
    </div>
  );
}