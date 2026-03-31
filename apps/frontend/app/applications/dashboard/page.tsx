// D:\Project\ai-interview-tracker\apps\frontend\app\applications\dashboard\page.tsx

"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useApplicationStore } from "@/features/applications/store";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useSidebar } from "@/components/layout/sidebar-context";



const StatusChart = dynamic(
    () => import("@/features/applications/components/StatusChart"),
    { ssr: false }
);

export default function Dashboard() {
    const { isCollapsed } = useSidebar();
    const applications = useApplicationStore((state) => state.applications);
    const fetchApplications = useApplicationStore((state) => state.fetchApplications);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // 🔥 STATS CALCULATION
    const stats = {
        total: applications.length,
        applied: applications.filter((a) => a.status === "applied").length,
        interview: applications.filter((a) => a.status === "interview").length,
        offer: applications.filter((a) => a.status === "offer").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
        oa: applications.filter((a) => a.status === "oa").length,
    };



    // 🔥 RECENT (latest 5)
    const recent = [...applications]
        .sort(
            (a, b) =>
                new Date(b.appliedDate).getTime() -
                new Date(a.appliedDate).getTime()
        )
        .slice(0, 5);

    const statusCount = {
        applied: 0,
        oa: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
    };

    applications.forEach((app) => {
        const status = String(app.status).toLowerCase().trim();
        if (status in statusCount) {
            statusCount[status as keyof typeof statusCount]++;
        }
    });

    const chartData = [
        { name: "Applied", value: Number(statusCount.applied) || 0 },
        { name: "OA", value: Number(statusCount.oa) || 0 },
        { name: "Interview", value: Number(statusCount.interview) || 0 },
        { name: "Offer", value: Number(statusCount.offer) || 0 },
        { name: "Rejected", value: Number(statusCount.rejected) || 0 },
    ].filter((item) => item.value > 0);

    return (
        <div className="flex">
            <Sidebar />

            <div className={`flex-1 transition-all duration-300 
                ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
                <Navbar />

                <div className="p-6 space-y-6">

                    {/* 🔥 STATS */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                        <StatCard title="Total" value={stats.total} />
                        <StatCard title="Applied" value={stats.applied} />
                        <StatCard title="OA" value={stats.oa} />
                        <StatCard title="Interview" value={stats.interview} />
                        <StatCard title="Offer" value={stats.offer} />
                        <StatCard title="Rejected" value={stats.rejected} />

                    </div>

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* 📊 Chart */}
                        <div className="border rounded-lg p-4">
                            <h2 className="text-lg font-bold mb-3">
                                Status Distribution
                            </h2>
                            {applications.length === 0 ? (
                                <p className="text-center text-gray-500">Loading chart...</p>
                            ) : (
                                <StatusChart key={applications.length} data={chartData} />
                            )}
                        </div>

                        {/* 📌 Insight box */}
                        <div className="border rounded-lg p-4">
                            <h2 className="text-lg font-bold mb-3">
                                Insights
                            </h2>

                            <ul className="space-y-2 text-sm">
                                {stats.rejected > stats.offer && (
                                    <li>⚠️ High rejection rate — improve resume</li>
                                )}

                                {stats.interview > 0 && (
                                    <li>🎯 You are getting interviews — keep going!</li>
                                )}

                                {stats.offer > 0 && (
                                    <li>🔥 Congrats! You have offers</li>
                                )}

                                {stats.total === 0 && (
                                    <li>🚀 Start applying to jobs</li>
                                )}
                            </ul>
                        </div>

                    </div>

                    {/* 🔥 RECENT */}
                    <div className="border rounded-lg p-4">
                        <h2 className="text-lg font-bold mb-3">
                            Recent Applications
                        </h2>

                        {recent.length === 0 && <p>No data</p>}

                        <div className="space-y-2">
                            {recent.map((app) => (
                                <div
                                    key={app._id}
                                    className="flex justify-between border p-2 rounded"
                                >
                                    <span>
                                        {app.company} - {app.role}
                                    </span>

                                    <span className="text-sm text-gray-500">
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// 🔥 SMALL COMPONENT
function StatCard({ title, value }: any) {
    return (
        <div className="p-4 border rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">{title}</p>
            <h2 className="text-xl font-bold">{value}</h2>
        </div>
    );
}