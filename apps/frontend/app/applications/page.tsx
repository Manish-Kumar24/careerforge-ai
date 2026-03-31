// D:\Project\ai-interview-tracker\apps\frontend\app\applications\page.tsx

"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";
import { useApplicationStore } from "../../features/applications/store";
import ApplicationCard from "../../features/applications/components/ApplicationCard";
import ApplicationModal from "../../features/applications/components/ApplicationModal";
import { useSidebar } from "../../components/layout/sidebar-context";

export default function ApplicationsPage() {
  const { isCollapsed } = useSidebar();
  const { applications, fetchApplications, loading } = useApplicationStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications
    .filter((app) =>
      app.company.toLowerCase().includes(search.toLowerCase())
    )
    .filter((app) =>
      statusFilter === "all"
        ? true
        : app.status?.toLowerCase() === statusFilter.toLowerCase()
    ).filter((app) =>
      priorityFilter === "all"
        ? true
        : (app as any).isPriority === true  // ✅ Filter by priority (fallback for missing type property)
  )
    .sort((a, b) => {
      if (a.isPriority !== b.isPriority) {
      return a.isPriority ? -1 : 1;
    }
      const aTime = new Date((a as { createdAt?: string | number }).createdAt ?? 0).getTime();
      const bTime = new Date((b as { createdAt?: string | number }).createdAt ?? 0).getTime();

      if (sortOrder === "newest") {
        return bTime - aTime;
      } else {
        return aTime - bTime;
      }
    });

  return (
    <div className="flex">
      <Sidebar />

      {/* ✅ DYNAMIC MARGIN based on collapse state */}
      <div className={`flex-1 transition-all duration-300 
                      ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold">Applications</h1>

            <div className="flex gap-3 flex-wrap">
              <input
                placeholder="Search company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="oa">OA</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border px-3 py-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Modal */}
          <ApplicationModal />

          {/* Loading State */}
          {loading && <p>Loading...</p>}

          {/* Empty State */}
          {!loading && filteredApplications.length === 0 && (
            <p>No applications found</p>
          )}

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((app) => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}