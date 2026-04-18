// apps/frontend/lib/axios.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // ✅ Read token from localStorage (matches useAuth)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Cache buster for GET requests
  if (config.method === "get") {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.name !== "CanceledError" && !error.message?.includes("abort")) {
      console.error("❌ API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default api;