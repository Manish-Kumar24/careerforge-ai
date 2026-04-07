// apps/frontend/features/practice/store.ts

import { create } from "zustand";
import {
  getProblems,
  updateProgress,
  getProgressSummary,
  getFilterOptions,
} from "./api";
import { PracticeProblem, ProgressSummary, FilterOptions } from "@/types/practice";

// ✅ Explicitly define the store interface for TypeScript
interface PracticeStore {
  problems: PracticeProblem[];
  summary: ProgressSummary | null;
  filterOptions: FilterOptions | null;
  loading: boolean;
  error: string | null;
  currentFilters: Record<string, any>;

  // Actions with explicit types
  fetchProblems: (filters?: Record<string, any>) => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  updateProblemProgress: (id: string,  data:Record<string, any>) => Promise<void>; // ✅ Fixed: Added ''
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  problems: [],
  summary: null,
  filterOptions: null,
  loading: false,
  error: null,
  currentFilters: {},

  fetchProblems: async (filters) => {
    set({ loading: true, error: null });
    
    // Store filters for later re-fetches
    if (filters) {
      set({ currentFilters: filters });
    }
    
    try {
      const data = await getProblems(filters || get().currentFilters);
      // ✅ Use functional update to avoid stale state
      set((state) => ({
        problems: data,
        loading: false,
      }));
    } catch (err: any) {
      console.error("Error fetching problems:", err);
      set({ error: "Failed to fetch problems", loading: false });
    }
  },

  fetchSummary: async () => {
    try {
      const data = await getProgressSummary();
      set({ summary: data });
    } catch (err: any) {
      console.error("Error fetching summary:", err);
    }
  },

  fetchFilterOptions: async () => {
    try {
      const data = await getFilterOptions();
      set({ filterOptions: data });
    } catch (err: any) {
      console.error("Error fetching filters:", err);
    }
  },

  updateProblemProgress: async (id, data) => {
    try {
      await updateProgress(id, data);
      // ✅ Re-fetch WITH current filters to preserve UI state
      const store = get();
      await store.fetchProblems(store.currentFilters);
      await store.fetchSummary();
    } catch (err: any) {
      console.error("Error updating progress:", err);
      throw err;
    }
  },
}));