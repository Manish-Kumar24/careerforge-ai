// filepath: apps/frontend/store/useChatSession.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
};

export type ChatSession = {
  _id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type SessionPreview = Omit<ChatSession, "messages">;

interface ChatSessionState {
  // State
  activeSessionId: string | null;
  sessions: SessionPreview[];
  activeSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: (initialMessage?: string) => Promise<ChatSession>;
  setActiveSession: (id: string) => Promise<void>;
  addMessage: (sessionId: string, message: ChatMessage) => Promise<ChatSession>;
  deleteSession: (id: string) => Promise<void>;
  updateSessionTitle: (id: string, title: string) => Promise<void>;
  clearActiveSession: () => void;
}

export const useChatSession = create<ChatSessionState>()(
  persist(
    (set, get) => ({
      activeSessionId: null,
      sessions: [],
      activeSession: null,
      isLoading: false,
      error: null,

      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get<SessionPreview[]>("/ai/sessions");
          set({ sessions: data, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Failed to load sessions", isLoading: false });
        }
      },

      createSession: async (initialMessage?: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<ChatSession>("/ai/sessions", { initialMessage });
          // Add to sessions list (optimistic update)
          set((state) => ({
            sessions: [
              { _id: data._id, userId: data.userId, title: data.title, createdAt: data.createdAt, updatedAt: data.updatedAt },
              ...state.sessions
            ],
            activeSessionId: data._id,
            activeSession: data,
            isLoading: false
          }));
          return data;
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Failed to create session", isLoading: false });
          throw err;
        }
      },

      setActiveSession: async (id: string) => {
        set({ isLoading: true, error: null, activeSessionId: id });
        try {
          const { data } = await api.get<ChatSession>(`/ai/sessions/${id}`);
          set({ activeSession: data, isLoading: false });
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Failed to load session", isLoading: false });
        }
      },

      addMessage: async (sessionId: string, message: ChatMessage) => {
        try {
          const { data } = await api.post<ChatSession>(`/ai/sessions/${sessionId}/message`, { message });
          // Update active session + sessions list preview
          set((state) => ({
            activeSession: data,
            sessions: state.sessions.map((s) =>
              s._id === sessionId ? { ...s, title: data.title, updatedAt: data.updatedAt } : s
            )
          }));
          return data;
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Failed to send message" });
          throw err;
        }
      },

      deleteSession: async (id: string) => {
        try {
          await api.delete(`/ai/sessions/${id}`);
          set((state) => ({
            sessions: state.sessions.filter((s) => s._id !== id),
            activeSession: state.activeSessionId === id ? null : state.activeSession,
            activeSessionId: state.activeSessionId === id ? null : state.activeSessionId
          }));
        } catch (err: any) {
          set({ error: err.response?.data?.error || "Failed to delete session" });
          throw err;
        }
      },

      updateSessionTitle: async (id: string, title: string) => {
        try {
          // Note: Backend doesn't have PATCH endpoint yet; this is a placeholder
          // For now, we'll update locally only
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s._id === id ? { ...s, title } : s
            ),
            activeSession: state.activeSession?._id === id ? { ...state.activeSession, title } : state.activeSession
          }));
        } catch (err: any) {
          set({ error: "Failed to update title" });
        }
      },

      clearActiveSession: () => {
        set({ activeSessionId: null, activeSession: null });
      }
    }),
    {
      name: "chat-session-storage", // localStorage key
      partialize: (state) => ({
        // Only persist minimal state; sessions reload from API on mount
        activeSessionId: state.activeSessionId
      })
    }
  )
);