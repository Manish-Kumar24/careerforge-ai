// apps/frontend/lib/axios.ts

import axios from "axios";

// ✅ Use absolute URL from environment variable (works on Vercel + local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,  // ✅ Absolute URL, not relative
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    // ✅ Disable cache for all requests
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // ✅ Add cache-busting timestamp to GET requests
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),  // Cache buster
    };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only log real errors (not abort/cancel)
    if (error.name !== 'CanceledError' && !error.message?.includes('abort')) {
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