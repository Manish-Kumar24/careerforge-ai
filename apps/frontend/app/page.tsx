// apps/frontend/app/page.tsx

"use client";

import Link from "next/link";
import { Brain, Target, Shield } from "lucide-react";

export default function LandingPage() {
  // ✅ NO auth checks. NO redirects. NO useEffect.
  // This page ALWAYS renders for everyone.

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">AI Interview Tracker</span>
        </div>
        {/* ✅ ONLY these two buttons */}
        <div className="flex gap-3">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Ace Your Next Interview with AI
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Practice DSA, System Design, and Behavioral questions with real-time AI feedback. 
          Track progress, get personalized insights, and simulate real company interview loops.
        </p>

        {/* ✅ ONLY these two CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/register" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Get Started Free
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
          >
            Log In to Dashboard
          </Link>
        </div>

        {/* Features (optional, but nice to have) */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Target className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Practice</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              DSA, AI/ML, System Design questions with real-time AI feedback and on-demand hints.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Shield className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Company Loops</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Simulate Meta, Google, Amazon hiring pipelines with multi-day scheduling and progress tracking.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Brain className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track progress with score trends, skill breakdowns, and personalized improvement insights.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} AI Interview Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}