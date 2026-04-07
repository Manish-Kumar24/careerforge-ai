// apps\frontend\components\features\practice\FilterBar.tsx

"use client";

import { FilterOptions } from "@/types/practice";
import { useState, useEffect, useRef } from "react";

interface FilterBarProps {
  filters: {
    pattern: string;
    company: string;
    difficulty: string;
    status: string;
    search: string;
    bookmarked: boolean;
  };
  setFilters: (filters: any) => void;
  filterOptions: FilterOptions | null;
}

export default function FilterBar({ filters, setFilters, filterOptions }: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // ✅ FIX 1: Use ref to store latest filters without triggering re-renders
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // ✅ FIX 2: Debounce search input WITHOUT filters in dependency array
  useEffect(() => {
    const timer = setTimeout(() => {
      // ✅ Use ref to get latest filters without causing re-render loop
      setFilters({ ...filtersRef.current, search: searchInput.trim() });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchInput, filtersRef, setFilters]); // ✅ Removed 'filters' from dependencies

  const handleReset = () => {
    setSearchInput("");
    setFilters({
      pattern: "",
      company: "",
      difficulty: "",
      status: "",
      search: "",
      bookmarked: false,
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search problems..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 min-w-[200px] border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
        />

        {/* Pattern Filter */}
        <select
          value={filters.pattern}
          onChange={(e) => setFilters({ ...filters, pattern: e.target.value })}
          className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Patterns</option>
          {filterOptions?.patterns.map((pattern) => (
            <option key={pattern} value={pattern}>
              {pattern}
            </option>
          ))}
        </select>

        {/* Company Filter */}
        <select
          value={filters.company}
          onChange={(e) => setFilters({ ...filters, company: e.target.value })}
          className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Companies</option>
          {filterOptions?.companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* ✅ Bookmarked Filter */}
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.bookmarked}
            onChange={(e) => setFilters({ ...filters, bookmarked: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>🔖 Bookmarked</span>
        </label>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}