// filepath: app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";
import { useSidebar } from "../../components/layout/sidebar-context";
import { useAuth } from "../../store/useAuth";
import { dashboardApi, DashboardStats } from "../../features/dashboard/api";

export default function Dashboard() {
  const { isCollapsed } = useSidebar();
  const { email } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(err.response?.data?.error || "Failed to load metrics");
        // Fallback to safe defaults
        setStats({
          applications: 0,
          applicationSuccessRate: 0,
          applicationBreakdown: {},
          dsaSolved: 0,
          dsaTotal: 0,
          dsaSuccessRate: 0,
          dsaProgress: { completed: 0, inProgress: 0, notStarted: 0 },
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const getUserName = () => {
    if (!email) return "there";
    return email.split('@')[0];
  };

  // ✅ Helper: Format application status with emoji + color
  const getStatusDisplay = (status: string, count: number) => {
    const config: Record<string, { emoji: string; color: string }> = {
      offer: { emoji: "🎉", color: "text-green-600 dark:text-green-400" },
      rejected: { emoji: "❌", color: "text-red-600 dark:text-red-400" },
      interview: { emoji: "💼", color: "text-blue-600 dark:text-blue-400" },
      oa: { emoji: "💻", color: "text-purple-600 dark:text-purple-400" },
      applied: { emoji: "📤", color: "text-gray-600 dark:text-gray-400" }
    };
    const { emoji, color } = config[status] || { emoji: "📋", color: "text-gray-600" };
    return (
      <span key={status} className={`flex items-center gap-1 text-sm ${color}`}>
        {emoji} {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
      </span>
    );
  };

  // ✅ Helper: Calculate progress bar width
  const getProgressWidth = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.min(100, Math.round((value / total) * 100))}%`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 
                ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        {/* Welcome Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back, {getUserName()} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Here's your progress overview
          </p>
        </div>

        {/* Stats Grid - Now 2 Rich Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ✅ APPLICATIONS CARD */}
          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Applications</p>
              {stats?.applicationSuccessRate !== undefined && (
                <span className={`text-sm font-semibold ${
                  stats.applicationSuccessRate >= 70 ? 'text-green-600 dark:text-green-400' :
                  stats.applicationSuccessRate >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {stats.applicationSuccessRate}% Success
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                <div className="space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />)}
                </div>
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">—</p>
            ) : (
              <>
                {/* Total Count */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {stats?.applications ?? 0}
                </h2>
                
                {/* Status Breakdown */}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {stats?.applicationBreakdown && Object.entries(stats.applicationBreakdown)
                    .filter(([_, count]) => count > 0)
                    .map(([status, count]) => getStatusDisplay(status, count))}
                  {(!stats?.applicationBreakdown || Object.values(stats.applicationBreakdown).every(c => c === 0)) && (
                    <p className="text-sm text-gray-400">No applications yet</p>
                  )}
                </div>
                
                {/* Progress Bar */}
                {stats?.applications && stats.applications > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Offer Rate</span>
                      <span>{stats.applicationBreakdown?.offer || 0}/{stats.applications}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: getProgressWidth(stats.applicationBreakdown?.offer || 0, stats.applications) }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ✅ DSA SOLVED CARD */}
          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">DSA Progress</p>
              {stats?.dsaSuccessRate !== undefined && (
                <span className={`text-sm font-semibold ${
                  stats.dsaSuccessRate >= 70 ? 'text-green-600 dark:text-green-400' :
                  stats.dsaSuccessRate >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {stats.dsaSuccessRate}% Complete
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">—</p>
            ) : (
              <>
                {/* Solved Count */}
                <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats?.dsaSolved ?? 0}
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  of {stats?.dsaTotal ?? 0} problems
                </p>
                
                {/* Progress Bar with Segments */}
                {stats?.dsaProgress && stats.dsaTotal && stats.dsaTotal > 0 && (
                  <div className="space-y-3">
                    {/* Segmented Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="flex h-full">
                        {/* Completed Segment */}
                        <div 
                          className="bg-green-500 transition-all"
                          style={{ width: getProgressWidth(stats.dsaProgress.completed, stats.dsaTotal) }}
                          title={`${stats.dsaProgress.completed} completed`}
                        />
                        {/* In-Progress Segment */}
                        <div 
                          className="bg-yellow-500 transition-all"
                          style={{ width: getProgressWidth(stats.dsaProgress.inProgress, stats.dsaTotal) }}
                          title={`${stats.dsaProgress.inProgress} in progress`}
                        />
                        {/* Not Started (implicit: fills remaining space) */}
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Completed: {stats.dsaProgress.completed}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        In Progress: {stats.dsaProgress.inProgress}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                        Remaining: {stats.dsaProgress.notStarted}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* Last Updated Timestamp */}
        {!loading && stats && (
          <div className="px-6 pb-6">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
              Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}