// apps/frontend/app/interview/page.tsx

"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { interviewApi } from "@/features/interview/api";
import { getFilterParams, transformTrendData, transformRadarData } from "@/features/interview/analytics";
import FilterBar from "@/components/features/interview/FilterBar";
import PerformanceChart from "@/components/features/interview/PerformanceChart";
import CategoryRadar from "@/components/features/interview/CategoryRadar";
import { ArrowRight, Target, Briefcase, TrendingUp, Award } from "lucide-react";

// ✅ Type for filters
type FilterState = {
  type: string;
  company: string;
  timeRange: "7d" | "30d" | "all";
};

// ✅ INNER COMPONENT: Contains all logic using useSearchParams (now safe inside Suspense)
function InterviewDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIX: Stable initial filters from URL (only on mount)
  const initialFilters = useMemo((): FilterState => ({
    type: searchParams.get("type") || "",
    company: searchParams.get("company") || "",
    timeRange: (searchParams.get("timeRange") as FilterState["timeRange"]) || "30d"
  }), []); // Empty deps = compute once on mount

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // ✅ FIX: Stable fetch function
  const fetchStats = useCallback(async (filterParams: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await interviewApi.getDashboardStats(filterParams);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Fetch when filters change (stable deps)
  useEffect(() => {
    const params = getFilterParams(filters);
    fetchStats(params);
  }, [filters, fetchStats]);

  // ✅ FIX: Update URL WITHOUT calling router.push during render
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      // Only update URL if values actually changed
      if (
        prev.type === updated.type &&
        prev.company === updated.company &&
        prev.timeRange === updated.timeRange
      ) {
        return prev;
      }
      // Schedule URL update AFTER state update completes
      setTimeout(() => {
        const params = new URLSearchParams();
        if (updated.type) params.set("type", updated.type);
        if (updated.company) params.set("company", updated.company);
        if (updated.timeRange) params.set("timeRange", updated.timeRange);
        const queryString = params.toString();
        router.replace(`/interview${queryString ? `?${queryString}` : ""}`, {
          scroll: false
        } as any); // Type assertion for Next.js 16 compatibility
      }, 0);
      return updated;
    });
  }, [router]);

  // ✅ FIX: Memoized derived data
  const trendData = useMemo(() =>
    stats?.trend ? transformTrendData(stats.trend) : [],
    [stats?.trend]
  );

  const radarData = useMemo(() =>
    stats?.categoryAverages ? transformRadarData(stats.categoryAverages) : [],
    [stats?.categoryAverages]
  );

  // Loading state
  if (loading && !stats) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />)}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ EMPTY STATE: Show welcome screen for first-time users
  if (!loading && stats?.totalSessions === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Mock Interviews! 🎯</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Start practicing to see your analytics here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => router.push("/interview/practice")}
            className="p-6 border rounded-xl hover:border-blue-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-semibold text-lg">Quick Practice</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Jump into a single-topic session (DSA, AI/ML, Behavioral). Instant start.
            </p>
          </button>

          <button
            onClick={() => router.push("/interview/loop/setup")}
            className="p-6 border rounded-xl hover:border-purple-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800 text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <span className="font-semibold text-lg">Company Interview</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Simulate Meta/Google/Amazon hiring loops. Multi-day, progressive rounds.
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Analytics</h1>
            <p className="text-gray-500 mt-1">Track your progress and identify areas to improve</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/interview/practice")}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
            >
              🎯 Quick Practice
            </button>
            <button
              onClick={() => router.push("/interview/loop/setup")}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              🏢 Company Loop
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        initialFilters={initialFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <Target className="w-4 h-4" /> Total Sessions
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats?.totalSessions || 0}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <Award className="w-4 h-4" /> Average Score
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {stats?.avgScore ? `${stats.avgScore}/100` : "—"}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <TrendingUp className="w-4 h-4" /> Trend
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {trendData.length >= 2 && trendData[trendData.length - 1].score > trendData[0].score ? "↗ Improving" : "→ Stable"}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <Briefcase className="w-4 h-4" /> Active Loops
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {stats?.loopProgress?.filter((l: any) => l.completed < l.total).length || 0}
          </div>
        </div>
      </div>

      {/* Continue Your Loops Section */}
      {stats?.loopProgress?.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Continue Your Loops</h3>
            <button
              onClick={() => router.push("/interview/loop/setup")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Start New Loop
            </button>
          </div>

          {(() => {
            const now = new Date();
            const activeLoops = (stats.loopProgress || []).filter((loop: any) => {
              const isRecent = loop.createdAt && new Date(loop.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
              return loop.completed > 0 || isRecent;
            });

            if (activeLoops.length === 0) {
              return (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border text-center text-gray-500">
                  No active loops. Start a new one to begin your interview journey!
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {activeLoops.map((loop: any) => (
                  <div
                    key={loop.loopId}
                    className="p-4 bg-white dark:bg-gray-800 rounded-xl border flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Progress Circle */}
                      <div className="relative w-12 h-12">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="3" className="dark:stroke-gray-700" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${loop.completionRate} 100`} className="transition-all duration-300" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                          {loop.completed}/{loop.total}
                        </span>
                      </div>

                      {/* Loop Info */}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {loop.company} • {loop.role}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loop.completed} of {loop.total} rounds completed
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/interview/loop/${loop.loopId}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {loop.completed > 0 ? "Continue" : "Start"} →
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border min-h-[280px]">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Score Trend</h3>
          {typeof window !== "undefined" && (
            <PerformanceChart data={trendData} />
          )}
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border min-h-[280px]">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Skill Breakdown</h3>
          {typeof window !== "undefined" && (
            <CategoryRadar data={radarData} />
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {stats?.recentSessions?.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {stats.recentSessions.map((session: any) => (
              <div key={session.sessionId} className="p-4 bg-white dark:bg-gray-800 rounded-xl border flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {session.type.replace("_", " / ")} • {session.difficulty}
                    {session.companyTag && ` • ${session.companyTag}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {session.score && (
                    <span className={`font-bold ${session.score >= 80 ? "text-green-600" : session.score >= 60 ? "text-yellow-600" : "text-red-600"
                      }`}>
                      {session.score}/100
                    </span>
                  )}
                  <button
                    onClick={() => router.push(`/interview/report/${session.sessionId}`)}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                  >
                    View Report <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ SKELETON: Loading fallback for Suspense boundary
function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />)}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// ✅ PARENT COMPONENT: Wraps content in Suspense boundary (fixes the build error)
export default function InterviewDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <InterviewDashboardContent />
    </Suspense>
  );
}