// apps\frontend\features\practice\api.ts

import api from "@/lib/axios";
import { PracticeProblem, ProgressSummary, FilterOptions } from "@/types/practice";

export const getProblems = async (filters?: {
  pattern?: string;
  topic?: string;
  company?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  bookmarked?: boolean;
}) => {
  const params = new URLSearchParams();
  if (filters?.pattern) params.append("pattern", filters.pattern);
  if (filters?.topic) params.append("topic", filters.topic);
  if (filters?.company) params.append("company", filters.company);
  if (filters?.difficulty) params.append("difficulty", filters.difficulty);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.bookmarked) params.append("bookmarked", "true");

  const res = await api.get(`/practice?${params.toString()}`);
  return res.data as PracticeProblem[];
};

export const getProblemById = async (id: string) => {
  const res = await api.get(`/practice/${id}`);
  return res.data as PracticeProblem;
};

export const updateProgress = async (
  id: string,
  data: {  // ✅ FIX: Added 'data:' parameter name
    status?: string;
    notes?: string;
    attempts?: number;
    timeSpent?: number;
  }
) => {
  const res = await api.patch(`/practice/${id}/progress`, data);
  return res.data;
};

export const getProgressSummary = async () => {
  const res = await api.get("/practice/summary");
  return res.data as ProgressSummary;
};

export const getFilterOptions = async () => {
  const res = await api.get("/practice/filters");
  return res.data as FilterOptions;
};

// Timer functions
export const startProblemTimer = async (id: string, targetSeconds?: number) => {
  const res = await api.post(`/practice/${id}/timer/start`, { targetSeconds });
  return res.data;
};

export const toggleProblemTimer = async (id: string) => {
  const res = await api.patch(`/practice/${id}/timer/toggle`);
  return res.data;
};

export const resetProblemTimer = async (id: string) => {
  const res = await api.delete(`/practice/${id}/timer`);
  return res.data;
};

export const getProblemTimer = async (id: string) => {
  const res = await api.get(`/practice/${id}/timer`);
  return res.data;
};

// Bookmark function
export const toggleProblemBookmark = async (id: string) => {
  const res = await api.patch(`/practice/${id}/bookmark`);
  return res.data;
};