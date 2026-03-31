// filepath: app/dashboard/page.tsx

"use client";

import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";
import { useSidebar } from "../../components/layout/sidebar-context";


export default function Dashboard() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 
                ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0`}>
        <Navbar />

        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
            <p className="text-gray-500">Applications</p>
            <h2 className="text-2xl font-bold">10</h2>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
            <p className="text-gray-500">DSA Solved</p>
            <h2 className="text-2xl font-bold">120</h2>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
            <p className="text-gray-500">Success Rate</p>
            <h2 className="text-2xl font-bold">60%</h2>
          </div>
        </div>
      </div>
    </div>
  );
}