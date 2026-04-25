// filepath: apps/frontend/features/dashboard/api.ts

import api from "@/lib/axios";

export interface DashboardStats {
  // Applications card
  applications: number;
  applicationSuccessRate: number;
  applicationBreakdown: Record<string, number>; // { offer: 2, rejected: 1, oa: 1, ... }
  
  // DSA card
  dsaSolved: number;
  dsaTotal: number;
  dsaSuccessRate: number;
  dsaProgress: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  
  lastUpdated: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get("/dashboard/stats");
    return data;
  }
};