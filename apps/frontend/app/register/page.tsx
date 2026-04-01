// filepath: app/register/page.tsx

"use client";

import { useState } from "react";
import api from "../../lib/axios";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.post("/auth/signup", form);
      // ✅ Show success + redirect
      alert("✅ Account created! Please login.");
      router.push("/login");
    } catch (err: any) {
      console.error("Signup error:", err);
      // ✅ Show user-friendly error
      setError(err.response?.data?.message || "Signup failed. Please try again.");
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
      <div className="w-96 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg space-y-6">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>
        {/* ✅ Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            value={form.email}
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input
            value={form.password}
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <Button onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>
        </div>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}