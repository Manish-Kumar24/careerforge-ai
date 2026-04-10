"use client";

import { ResumeAnalysis } from "@/types/resume";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Props {
  analysis: ResumeAnalysis;
}

// ✅ FIX 1: Move ScoreGauge OUTSIDE AnalysisResult (prevents re-creation on render)
function ScoreGauge({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e";    // green-500
    if (s >= 60) return "#eab308";    // yellow-500
    return "#ef4444";                 // red-500
  };

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Score: ${score} out of 100`}>
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Score text in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-xs text-gray-500">/100</span>
      </div>
    </div>
  );
}

export default function AnalysisResult({ analysis }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // ✅ FIX 2: Removed unused getScoreIcon function

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      {/* ✅ FIX 3: Removed duplicate comment + added responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">Overall ATS Score</h3>
          <p className="text-sm text-gray-500">Based on AI analysis</p>
        </div>
        
        <ScoreGauge score={analysis.aiScore} />
        
        <span className={`text-sm font-medium text-center sm:text-right ${getScoreColor(analysis.aiScore)}`}>
          {analysis.aiScore >= 80 ? 'Excellent' : analysis.aiScore >= 60 ? 'Good' : 'Needs Improvement'}
        </span>
      </div>

      {/* Summary */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">{analysis.overall_summary}</p>
      </div>

      {/* Feedback Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ATS Compatibility */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">ATS Compatibility</h5>
            <span className={`text-sm font-semibold ${getScoreColor(analysis.feedback.ats_compatibility.score)}`}>
              {analysis.feedback.ats_compatibility.score}/100
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {analysis.feedback.ats_compatibility.feedback}
          </p>
        </div>

        {/* Skills Match */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">Skills Match</h5>
            <span className={`text-sm font-semibold ${getScoreColor(analysis.feedback.skills_match.score)}`}>
              {analysis.feedback.skills_match.score}/100
            </span>
          </div>
          {analysis.feedback.skills_match.missing.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">Missing keywords:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.feedback.skills_match.missing.slice(0, 5).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formatting */}
        <div className="p-4 border rounded-lg md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">Formatting</h5>
            <span className={`text-sm font-semibold ${getScoreColor(analysis.feedback.formatting.score)}`}>
              {analysis.feedback.formatting.score}/100
            </span>
          </div>
          {analysis.feedback.formatting.issues.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
              {analysis.feedback.formatting.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-600">No formatting issues detected</p>
          )}
        </div>

        {/* Keywords */}
        <div className="p-4 border rounded-lg md:col-span-2">
          <h5 className="font-medium mb-2">Keyword Analysis</h5>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Found ({analysis.feedback.keywords.found.length})</p>
              <div className="flex flex-wrap gap-1">
                {analysis.feedback.keywords.found.slice(0, 8).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Missing ({analysis.feedback.keywords.missing.length})</p>
              <div className="flex flex-wrap gap-1">
                {analysis.feedback.keywords.missing.slice(0, 8).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Steps */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommended Actions</h4>
        <ol className="list-decimal list-inside space-y-2">
          {analysis.actionable_steps.map((step, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-300">{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}