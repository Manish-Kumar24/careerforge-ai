// filepath: apps/frontend/features/interview/api.ts

import api from "@/lib/axios";
import {
  InterviewSession, InterviewLoop, SessionStartResponse,
  LoopCreateResponse, AnswerResponse, HintResponse, ReportResponse
} from "@/types/interview";

// ✅ FIX: Helper to normalize API errors for consistent UI messages
const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status (4xx/5xx)
    return error.response.data?.error || "Request failed";
  } else if (error.request) {
    // Request made but no response received (CORS, network down, server offline)
    return "Network error. Please check your connection and try again.";
  } else {
    // Other error (e.g., request config issue)
    return error.message || "An unexpected error occurred";
  }
};

export const interviewApi = {
  startPractice: async (payload: {
    type: string; difficulty: string; durationMinutes: number;
    companyTag?: string; resumeText?: string; jdText?: string;
  }): Promise<SessionStartResponse> => {
    try {
      const { data } = await api.post("/mock-interview/practice", payload);
      return data;
    } catch (error: any) {
      console.error("startPractice API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  createLoop: async (payload: {
    company: string; role: string; templateKey: string;
    resumeText?: string; jdText?: string;
  }): Promise<LoopCreateResponse> => {
    try {
      const { data } = await api.post("/mock-interview/loop", payload);
      return data;
    } catch (error: any) {
      console.error("createLoop API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  startLoopRound: async (loopId: string, roundNumber: number): Promise<SessionStartResponse> => {
    try {
      const { data } = await api.post(`/mock-interview/loop/${loopId}/round/${roundNumber}/start`);
      return data;
    } catch (error: any) {
      console.error("startLoopRound API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  submitAnswer: async (sessionId: string, answer: string): Promise<AnswerResponse> => {
    try {
      const { data } = await api.post(`/mock-interview/session/${sessionId}/answer`, { answer });
      return data;
    } catch (error: any) {
      console.error("submitAnswer API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  requestHint: async (sessionId: string): Promise<HintResponse> => {
    try {
      const { data } = await api.post(`/mock-interview/session/${sessionId}/hint`);
      return data;
    } catch (error: any) {
      console.error("requestHint API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  endSession: async (sessionId: string, reason?: "user_ended" | "time_expired"): Promise<ReportResponse> => {
    try {
      const { data } = await api.post(`/mock-interview/session/${sessionId}/end`, { reason });
      return data;
    } catch (error: any) {
      console.error("endSession API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  getHistory: async (filters?: { mode?: string; type?: string; company?: string; status?: string }): Promise<InterviewSession[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const { data } = await api.get(`/mock-interview/history?${params.toString()}`);
      return data;
    } catch (error: any) {
      console.error("getHistory API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  getLoopHistory: async (filters?: { company?: string; status?: string }): Promise<InterviewLoop[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const { data } = await api.get(`/mock-interview/loops?${params.toString()}`);
      return data;
    } catch (error: any) {
      console.error("getLoopHistory API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  getDashboardStats: async (filters?: { mode?: string; type?: string; company?: string; timeRange?: string }): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const { data } = await api.get(`/mock-interview/dashboard/stats?${params.toString()}`);
      return data;
    } catch (error: any) {
      console.error("getDashboardStats API error:", error);
      throw new Error(handleApiError(error));
    }
  },

  // Add to interviewApi object
  getLoopById: async (loopId: string): Promise<any> => {
    const { data } = await api.get(`/mock-interview/loop/${loopId}`);
    return data;
  },

  // Add after getLoopById
  getSessionById: async (sessionId: string): Promise<any> => {
    try {
      const { data } = await api.get(`/mock-interview/session/${sessionId}`);
      return data;
    } catch (error: any) {
      console.error("getSessionById API error:", error);
      throw new Error(handleApiError(error));
    }
  },
};