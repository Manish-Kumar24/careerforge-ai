import { DashboardStats } from "@/types/interview";

// Transform raw API response into chart-ready format
export const transformTrendData = (trend: DashboardStats["trend"]) => {
  return trend.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: d.avgScore,
    sessions: d.sessionCount
  }));
};

export const transformRadarData = (categories: DashboardStats["categoryAverages"]) => {
  return [
    { subject: "Technical", A: categories.technicalAccuracy, fullMark: 100 },
    { subject: "Problem Solving", A: categories.problemSolving, fullMark: 100 },
    { subject: "Communication", A: categories.communication, fullMark: 100 },
    { subject: "Code Structure", A: categories.codeStructure, fullMark: 100 }
  ];
};

export const getFilterParams = (filters: {
  mode?: string;
  type?: string;
  company?: string;
  timeRange?: string;
}): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filters.mode) params.mode = filters.mode;
  if (filters.type) params.type = filters.type;
  if (filters.company) params.company = filters.company;
  if (filters.timeRange) params.timeRange = filters.timeRange;
  return params;
};

// Debounce utility for filter inputs
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};