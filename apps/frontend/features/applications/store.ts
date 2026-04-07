// apps\frontend\features\applications\store.ts

import { create } from "zustand";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  togglePriority,
  addTimelineEntry,
} from "./api";
import { Application, ApplicationStatus } from "../../types/application";

type State = {
  applications: Application[];
  loading: boolean;
  error: string | null;

  fetchApplications: () => Promise<void>;
  addApplication: (data: Partial<Application>) => Promise<void>;
updateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
removeApplication: (id: string) => Promise<void>;
togglePriority: (id: string) => Promise<void>;
addTimelineNote: (id: string, note: string) => Promise<void>;  // ✅ New action
};

export const useApplicationStore = create<State>((set, get) => ({
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true });
    try {
      const data = await getApplications();

      console.log("Fetched Applications:", data);

      data.sort(
        (a, b) =>
          new Date(b.appliedDate).getTime() -
          new Date(a.appliedDate).getTime()
      );
      set({ applications: data, loading: false });
    } catch (e) {
      console.error("Error fetching applications:", e);
      set({ error: "Failed to fetch", loading: false });
    }
  },

  addApplication: async (data) => {
    try {
      await createApplication(data);
      await get().fetchApplications();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        throw error;
      }
      console.error("Failed to add application:", error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    await updateApplication(id, { status });
    await get().fetchApplications();
  },

  removeApplication: async (id) => {
    await deleteApplication(id);
    await get().fetchApplications();
  },

  togglePriority: async (id) => {
    const app = get().applications.find(a => a._id === id);
    if (app) {
      await togglePriority(id, !app.isPriority);
      await get().fetchApplications();
    }
  },

  // ✅ NEW: Add timeline note
  addTimelineNote: async (id, note) => {
    await addTimelineEntry(id, note);
    await get().fetchApplications();
  },
}));