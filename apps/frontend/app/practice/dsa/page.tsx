"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useSidebar } from "@/components/layout/sidebar-context";
import { usePracticeStore } from "@/features/practice/store";
import FilterBar from "@/components/features/practice/FilterBar";
import PatternGroup from "@/components/features/practice/PatternGroup";
import ProgressBar from "@/components/features/practice/ProgressBar";
import ProblemCard from "@/components/features/practice/ProblemCard";
import ExportButton from "@/components/features/practice/ExportButton"; // ✅ NEW IMPORT

export default function DSAPage() {
  const { isCollapsed } = useSidebar();
  const {
    problems,
    summary,
    filterOptions,
    loading,
    fetchProblems,
    fetchSummary,
    fetchFilterOptions,
  } = usePracticeStore();

  const [filterValues, setFilterValues] = useState({
    pattern: "",
    company: "",
    difficulty: "",
    status: "",
    search: "",
    bookmarked: false,
  });

  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // ✅ FIX: Debounced fetch without ref complexity
  const debouncedFetch = useCallback((filters: any) => {
    const timer = setTimeout(() => {
      fetchProblems(filters);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [fetchProblems]);

  // ✅ FIX: Initial fetch only on mount
  useEffect(() => {
    fetchProblems();
    fetchSummary();
    fetchFilterOptions();
  }, []);

  // ✅ FIX: Always fetch when filters change (even if all empty)
  useEffect(() => {
    const cleanup = debouncedFetch(filterValues);
    return cleanup;
  }, [filterValues, debouncedFetch]); // ✅ Removed hasActiveFilters check

  // ✅ FIX: Memoize grouped problems to prevent recalculation
  const groupedProblems = useMemo(() => {
    return problems.reduce((acc, problem) => {
      const primaryPattern = problem.patterns[0] || "Uncategorized";
      if (!acc[primaryPattern]) {
        acc[primaryPattern] = [];
      }
      acc[primaryPattern].push(problem);
      return acc;
    }, {} as Record<string, typeof problems>);
  }, [problems]);

  return (
    <div className="flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold">💻 DSA Practice</h1>

            {/* View Toggle + Export Button */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                }`}
              >
                📊 Table
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "card"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                }`}
              >
                📱 Cards
              </button>
              {/* ✅ NEW: Export CSV Button */}
              <ExportButton />
            </div>
          </div>

          {/* Progress Bar */}
          {summary && <ProgressBar summary={summary} />}

          {/* Filters */}
          <FilterBar
            filters={filterValues}
            setFilters={setFilterValues}
            filterOptions={filterOptions}
          />

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 text-gray-500">Loading problems...</div>
          )}

          {/* Problems List */}
          {!loading && viewMode === "table" && (
            <div className="space-y-4">
              {Object.entries(groupedProblems).map(([pattern, patternProblems]) => (
                <PatternGroup
                  key={pattern}
                  pattern={pattern}
                  problems={patternProblems}
                />
              ))}
            </div>
          )}

          {/* Cards View */}
          {!loading && viewMode === "card" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((problem) => (
                <ProblemCard key={problem._id} problem={problem} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && problems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No problems found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}