"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();

  const isActive = (href: string) => pathname === href;

  const navItems = [
    { href: "/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/applications", icon: "📋", label: "Applications" },
    { href: "/applications/dashboard", icon: "📈", label: "Analytics" },
    { href: "/practice", icon: "📚", label: "Practice" },
    { href: "/ai", icon: "🤖", label: "AI Chat" },
  ];

  return (
    <>
      {/* ✅ MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* ✅ SIDEBAR */}
      <div
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r 
        transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? "w-20" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* Logo / Toggle */}
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-2xl font-bold whitespace-nowrap">AI Tracker</h2>
            )}
            {isCollapsed && (
              <h2 className="text-2xl font-bold">🤖</h2>
            )}

            {/* Collapse Toggle (Desktop Only) */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg 
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? "→" : "←"}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => closeMobile()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${
                  isActive(item.href)
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }
                ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Collapse Hint (Desktop) */}
          {!isCollapsed && (
            <div className="hidden md:block pt-4 border-t">
              <p className="text-xs text-gray-400 text-center">
                {/* Click ← to collapse */}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}