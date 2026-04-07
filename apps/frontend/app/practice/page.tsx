// D:\Project\ai-interview-tracker\apps\frontend\app\practice\page.tsx

"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useSidebar } from "@/components/layout/sidebar-context";
import Link from "next/link";

export default function PracticePage() {
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<"dsa" | "ai-ml">("dsa");

  return (
    <div className="flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold">Practice</h1>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("dsa")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "dsa"
                    ? "bg-white dark:bg-gray-700 text-blue-600 shadow"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                💻 DSA
              </button>
              <button
                onClick={() => setActiveTab("ai-ml")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "ai-ml"
                    ? "bg-white dark:bg-gray-700 text-blue-600 shadow"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                🤖 AI/ML
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="border rounded-lg p-8 text-center">
            {activeTab === "dsa" ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">DSA Practice</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Master data structures and algorithms with curated problems
                </p>
                <Link
                  href="/practice/dsa"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Practicing →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">AI/ML Practice</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Coming soon! Curated AI/ML resources and projects
                </p>
                <div className="text-gray-400">🚧 Under Development</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}