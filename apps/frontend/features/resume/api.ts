// apps/frontend/features/resume/api.ts

import api from "@/lib/axios";
import { ResumeAnalysis } from "@/types/resume";

export const resumeApi = {
  uploadResume: async (file: File): Promise<ResumeAnalysis> => {
    const formData = new FormData();
    formData.append("resume", file);
    
    const { data } = await api.post<ResumeAnalysis>("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getHistory: async (): Promise<ResumeAnalysis[]> => {
    const { data } = await api.get<ResumeAnalysis[]>("/resume/history");
    return data;
  },

  getById: async (id: string): Promise<ResumeAnalysis> => {
    const { data } = await api.get<ResumeAnalysis>(`/resume/${id}`);
    return data;
  },
};