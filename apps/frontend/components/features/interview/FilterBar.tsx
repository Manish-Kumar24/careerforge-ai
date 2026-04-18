// filepath: apps/frontend/components/features/interview/FilterBar.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "@/features/interview/analytics";

// ✅ Explicit types for props
interface FilterBarProps {
  initialFilters: {
    type: string;
    company: string;
    timeRange: "7d" | "30d" | "all";
  };
  onFilterChange: (filters: Partial<{
    type: string;
    company: string;
    timeRange: "7d" | "30d" | "all";
  }>) => void;
}

// ✅ Local filter state type
type LocalFilters = {
  type: string;
  company: string;
  timeRange: "7d" | "30d" | "all";
};

export default function FilterBar({ initialFilters, onFilterChange }: FilterBarProps) {
  const router = useRouter();
  
  // ✅ Initialize from props only (no searchParams dependency)
  const [filters, setFilters] = useState<LocalFilters>(initialFilters);

  // ✅ Sync local state when initialFilters change (e.g., browser back/forward)
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // ✅ Memoized debounced URL update
  const applyFilters = useMemo(() => {
    return debounce((newFilters: LocalFilters) => {
      const params = new URLSearchParams();
      if (newFilters.type) params.set("type", newFilters.type);
      if (newFilters.company) params.set("company", newFilters.company);
      if (newFilters.timeRange) params.set("timeRange", newFilters.timeRange);
      
      const queryString = params.toString();
      // ✅ Use replace + scroll: false to avoid full re-render
      router.replace(`/interview${queryString ? `?${queryString}` : ""}`, { 
        scroll: false 
      } as any); // Type assertion for Next.js 16
      onFilterChange(newFilters);
    }, 300);
  }, [router, onFilterChange]);

  // ✅ Apply filters when local state changes
  useEffect(() => {
    // Only apply if different from initial (avoid initial mount trigger)
    if (
      filters.type !== initialFilters.type ||
      filters.company !== initialFilters.company ||
      filters.timeRange !== initialFilters.timeRange
    ) {
      applyFilters(filters);
    }
  }, [filters, initialFilters, applyFilters]);

  // ✅ Type-safe change handlers
  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value }));
  };

  const handleCompanyChange = (value: string) => {
    setFilters(prev => ({ ...prev, company: value }));
  };

  const handleTimeRangeChange = (value: "7d" | "30d" | "all") => {
    setFilters(prev => ({ ...prev, timeRange: value }));
  };

  const handleReset = () => {
    const resetFilters: LocalFilters = { type: "", company: "", timeRange: "30d" };
    setFilters(resetFilters);
    router.replace("/interview", { scroll: false } as any);
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
      {/* Type Filter */}
      <select
        value={filters.type}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="">All Types</option>
        <option value="DSA">DSA</option>
        <option value="AI_ML">AI/ML</option>
        <option value="SYSTEM_DESIGN">System Design</option>
        <option value="BEHAVIORAL">Behavioral</option>
      </select>

      {/* Company Filter */}
      <select
        value={filters.company}
        onChange={(e) => handleCompanyChange(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="">All Companies</option>
        <option value="Meta">Meta</option>
        <option value="Google">Google</option>
        <option value="Amazon">Amazon</option>
        <option value="Microsoft">Microsoft</option>
      </select>

      {/* Time Range */}
      <select
        value={filters.timeRange}
        onChange={(e) => handleTimeRangeChange(e.target.value as "7d" | "30d" | "all")}
        className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="all">All time</option>
      </select>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        Reset
      </button>
    </div>
  );
}