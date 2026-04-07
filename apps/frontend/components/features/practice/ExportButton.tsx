// apps/frontend/components/features/practice/ExportButton.tsx

"use client";

import { usePracticeStore } from "@/features/practice/store";

export default function ExportButton() {
  const { problems } = usePracticeStore();

  const handleExport = () => {
    if (problems.length === 0) return;

    // CSV headers
    const headers = [
      "Title",
      "Link",
      "Platform",
      "Difficulty",
      "Status",
      "Companies",
      "Patterns",
      "Notes",
      "Completed Date",
      "Time Spent (minutes)",
      "Bookmarked",
    ];

    // Map problems to CSV rows
    const rows = problems.map((problem) => {
      const progress = problem.progress;
      return [
        problem.title,
        problem.link,
        problem.platform,
        problem.difficulty,
        progress?.status || "not-started",
        problem.companies.join("; "),
        problem.patterns.join("; "),
        (progress?.notes || "").replace(/[\n\r,]/g, " "), // Escape commas/newlines
        progress?.completedAt ? new Date(progress.completedAt).toLocaleDateString() : "",
        progress?.timeSpent ? Math.round(progress.timeSpent / 60) : "",
        progress?.isBookmarked ? "Yes" : "No",
      ];
    });

    // Convert to CSV string with proper escaping
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape cells that contain commas, quotes, or newlines
            const cellStr = String(cell ?? "");
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `practice-progress-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={problems.length === 0}
      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      title="Export your practice progress to CSV"
    >
      📥 Export CSV
    </button>
  );
}