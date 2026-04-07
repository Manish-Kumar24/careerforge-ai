"use client";

import { useState } from "react";

interface CompanyTagsProps {
  companies: string[];
  maxVisible?: number;
}

export default function CompanyTags({ companies, maxVisible = 3 }: CompanyTagsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!companies || companies.length === 0) {
    return null;
  }

  const visibleCompanies = companies.slice(0, maxVisible);
  const remainingCount = companies.length - maxVisible;
  const hasMore = remainingCount > 0;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Visible Companies */}
      {visibleCompanies.map((company, index) => (
        <span
          key={index}
          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
        >
          {company}
        </span>
      ))}

      {/* +N Badge with Tooltip */}
      {hasMore && (
        <div 
          className="relative inline-block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* ✅ FIX: Changed cursor-help to cursor-pointer */}
          <span 
            className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded cursor-pointer"
          >
            +{remainingCount}
          </span>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
              <ul className="space-y-1">
                {companies.slice(maxVisible).map((company, index) => (
                  <li key={index}>{company}</li>
                ))}
              </ul>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}