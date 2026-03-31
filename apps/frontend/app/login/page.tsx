// filepath: app/login/page.tsx

"use client";

import { useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../store/useAuth";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../..//components/ui/button";
import { Card } from "../../components/ui/card";

export default function Login() {
  const { setToken } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    console.log("FORM DATA:", form);

    try {
      const res = await api.post("/auth/login", form);
      setToken(res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      console.log("ERROR:", err.response?.data);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
      <div className="w-96 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg space-y-6">

        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>

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

          <Button onClick={submit}>
            Login
          </Button>
        </div>

        <p className="text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}