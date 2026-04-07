// apps/frontend/types/practice.ts

export type Difficulty = "easy" | "medium" | "hard";
export type Platform = "leetcode" | "geeksforgeeks";
export type ProblemStatus = "not-started" | "in-progress" | "completed";

export interface PracticeProblem {
  _id: string;
  title: string;
  link: string;
  platform: Platform;
  patterns: string[];
  topics: string[];
  companies: string[];
  difficulty: Difficulty;
  tags: string[];
  isVerified: boolean;
  createdAt: string;
  progress?: PracticeProgress | null;
}

export interface PracticeProgress {
  _id: string;
  userId: string;
  problemId: string;
  status: ProblemStatus;
  attempts: number;
  notes: string;
  completedAt?: string;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
  isBookmarked?: boolean;
  timer?: {
    targetSeconds: number;
    remainingSeconds: number;
    startedAt?: string;
    pausedAt?: string;
    isRunning: boolean;
  };
}

export interface ProgressSummary {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percentage: number;
  byPattern: { 
    pattern: string; 
    total: number; 
    completed: number;
    inProgress: number;
    notStarted: number;
  }[];
}

export interface FilterOptions {
  patterns: string[];
  topics: string[];
  companies: string[];
}

export interface TimerResponse {
  remainingSeconds: number | null;
  isRunning: boolean;
  targetSeconds: number;
  isExpired: boolean;
}
