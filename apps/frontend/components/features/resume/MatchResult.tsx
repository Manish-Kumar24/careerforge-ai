// apps/frontend/components/features/resume/MatchResult.tsx

"use client";

import { JDMatch } from "@/types/jd";
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, Target } from "lucide-react";

interface Props {
  match: JDMatch;
}

export default function MatchResult({ match }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {match.jdTitle || "Job Description Match"}
            </h3>
            <p className="text-sm text-gray-500">
              Matched against: {match.resumeId.originalFilename}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getScoreIcon(match.matchScore)}
            <span className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
              {match.matchScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Keyword Match */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" /> Keyword Match
            </h5>
            <span className={`text-sm font-semibold ${getScoreColor(match.analysis.keyword_match.score)}`}>
              {match.analysis.keyword_match.score}/100
            </span>
          </div>
          {match.analysis.keyword_match.missing.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Missing keywords:</p>
              <div className="flex flex-wrap gap-1">
                {match.analysis.keyword_match.missing.slice(0, 6).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills Alignment */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium">Skills Alignment</h5>
            <span className={`text-sm font-semibold ${getScoreColor(match.analysis.skills_alignment.score)}`}>
              {match.analysis.skills_alignment.score}/100
            </span>
          </div>
          {match.analysis.skills_alignment.gaps.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Skill gaps:</p>
              <div className="flex flex-wrap gap-1">
                {match.analysis.skills_alignment.gaps.slice(0, 6).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Fit */}
        <div className="p-4 border rounded-lg md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">Experience Fit</h5>
            <span className={`text-sm font-semibold ${getScoreColor(match.analysis.experience_fit.score)}`}>
              {match.analysis.experience_fit.score}/100
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {match.analysis.experience_fit.feedback}
          </p>
        </div>

        {/* Education Match */}
        <div className="p-4 border rounded-lg md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">Education Match</h5>
            <span className={`text-sm font-semibold ${getScoreColor(match.analysis.education_match.score)}`}>
              {match.analysis.education_match.score}/100
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {match.analysis.education_match.feedback}
          </p>
        </div>
      </div>

      {/* Tailored Talking Points */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" /> Interview Talking Points
        </h4>
        <ol className="list-decimal list-inside space-y-2">
          {match.tailored_talking_points.map((point, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-1">
              {point}
            </li>
          ))}
        </ol>
      </div>

      {/* Suggested Improvements */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Suggested Resume Improvements</h4>
        <ul className="list-disc list-inside space-y-2">
          {match.suggested_improvements.map((step, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 pl-1">
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}