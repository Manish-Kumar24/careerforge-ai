"use client";

import { useSidebar } from "./sidebar-context";

export default function Navbar() {
  const { toggleMobile } = useSidebar();

  return (
    <nav className="border-b bg-white dark:bg-gray-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* ✅ MOBILE HAMBURGER BUTTON */}
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                     transition-colors"
            title="Open menu"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Page Title (Optional) */}
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Welcome Back
          </h1>
        </div>

        {/* Right Side (User, Notifications, etc.) */}
        <div className="flex items-center gap-4">
          {/* Add user avatar, notifications, etc. */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center 
                        text-white font-medium">
            U
          </div>
        </div>
      </div>
    </nav>
  );
}