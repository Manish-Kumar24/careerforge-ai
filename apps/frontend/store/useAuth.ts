// apps/frontend/store/useAuth.ts

import { create } from "zustand";

type AuthState = {
  token: string | null;
  email: string | null;
  setToken: (token: string, email?: string) => void;
  logout: () => void;
  // ✅ ADD: Method to force re-check localStorage
  refreshAuth: () => void;
};

// ✅ Read token synchronously at module load (not inside create)
const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getInitialEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("email");
};

export const useAuth = create<AuthState>((set) => ({
  // ✅ Use synchronous initial values
  token: getInitialToken(),
  email: getInitialEmail(),

  setToken: (token, email) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      if (email) localStorage.setItem("email", email);
    }
    set({ token, email: email || null });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
    }
    set({ token: null, email: null });
  },

  // ✅ Force re-read from localStorage (for Strict Mode safety)
  refreshAuth: () => {
    set({
      token: getInitialToken(),
      email: getInitialEmail(),
    });
  },
}));