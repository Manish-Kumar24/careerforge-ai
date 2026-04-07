// apps/frontend/components/features/practice/PlatformIcon.tsx

"use client";

import { useState } from "react";

interface PlatformIconProps {
  tags?: string[];  // ✅ ONLY tags to show in tooltip (no platform)
}

export default function PlatformIcon({ tags = [] }: PlatformIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // If no tags, don't render anything
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* ✅ FIX: Changed cursor-help to cursor-pointer (line 32) */}
      <span className="text-lg cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Problem sources">
        🔗
      </span>

      {/* Tooltip - ONLY shows tags */}
      {showTooltip && tags.length > 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 min-w-[180px]">
          <div className="font-medium mb-2 text-gray-300">Available on:</div>
          <ul className="space-y-1">
            {tags.map((tag, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-blue-400">•</span>
                <span>{tag}</span>
              </li>
            ))}
          </ul>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}