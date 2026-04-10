// apps/frontend/features/resume/jdApi.ts

import api from "@/lib/axios";
import { JDMatch, MatchRequest } from "@/types/jd";

export const jdApi = {
  matchWithJD: async (payload: MatchRequest): Promise<JDMatch> => {
    const { data } = await api.post<JDMatch>("/jd/match", payload);
    return data;
  },

  getHistory: async (resumeId?: string): Promise<JDMatch[]> => {
    const url = resumeId ? `/jd/history?resumeId=${resumeId}` : "/jd/history";
    const { data } = await api.get<JDMatch[]>(url);
    return data;
  },

  getById: async (id: string): Promise<JDMatch> => {
    const { data } = await api.get<JDMatch>(`/jd/${id}`);
    return data;
  },
};