// apps/frontend/store/useAuth.ts

import { create } from "zustand";

type AuthState = {
  token: string | null;
  email: string | null;  // ✅ NEW: Store user email
  setToken: (token: string, email?: string) => void;  // ✅ Updated signature
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null,
  email:
    typeof window !== "undefined"
      ? localStorage.getItem("email")  // ✅ NEW: Load email from localStorage
      : null,

  setToken: (token, email) => {
    localStorage.setItem("token", token);
    if (email) {
      localStorage.setItem("email", email);  // ✅ NEW: Save email
    }
    set({ token, email: email || null });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");  // ✅ NEW: Clear email
    set({ token: null, email: null });
  },
}));