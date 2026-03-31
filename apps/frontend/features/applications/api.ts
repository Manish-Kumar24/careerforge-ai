// D:\Project\ai-interview-tracker\apps\frontend\features\applications\api.ts

import api from "@/lib/axios";

export const getApplications = async () => {
  const res = await api.get("/applications"); // ✅ FIXED
  return res.data;
};

export const createApplication = async (data: any) => {
  const res = await api.post("/applications", data); // ✅ FIXED
  return res.data;
};

export const updateApplication = async (id: string, data: any) => {
  const res = await api.put(`/applications/${id}`, data); // ✅ FIXED
  return res.data;
};

export const deleteApplication = async (id: string) => {
  const res = await api.delete(`/applications/${id}`); // ✅ FIXED
  return res.data;
};

export const togglePriority = async (id: string, isPriority: boolean) => {
  const res = await api.patch(`/applications/${id}/priority`, { isPriority });
  return res.data;
};

// ✅ NEW: Add timeline entry
export const addTimelineEntry = async (id: string, note: string) => {
  const res = await api.post(`/applications/${id}/timeline`, { note });
  return res.data;
};