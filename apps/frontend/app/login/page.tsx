// apps/frontend/app/login/page.tsx

"use client";

import { useState, Suspense } from "react"; // ✅ ADD Suspense import
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../lib/axios";
import { useAuth } from "../../store/useAuth";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// ✅ 1. INNER COMPONENT: Contains all logic using useSearchParams
function LoginPageContent() {
  const { setToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Now safe inside Suspense

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/auth/login", form);
      
      // ✅ Save token + email to localStorage via zustand
      setToken(res.data.token, form.email);
      
      // ✅ Handle redirect parameter (e.g., ?redirect=/dashboard)
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.replace(redirect);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Welcome Back
        </h1>

        {/* ✅ Show error message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            value={form.email}
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            className="w-full"
          />
          <Input
            value={form.password}
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
            className="w-full"
          />
          <Button 
            onClick={submit} 
            disabled={loading || !form.email || !form.password}
            className="w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

// ✅ 2. MAIN EXPORT: Wraps content in Suspense with loading fallback
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black p-4">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg space-y-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}