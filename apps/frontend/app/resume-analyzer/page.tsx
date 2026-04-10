// apps/frontend/app/resume-analyzer/page.tsx

"use client";

"use client";

import { useState, useEffect, useCallback } from "react";
import ResumeUpload from "@/components/features/resume/ResumeUpload";
import AnalysisResult from "@/components/features/resume/AnalysisResult";
import { resumeApi } from "@/features/resume/api";
import { jdApi } from "@/features/resume/jdApi";
import { ResumeAnalysis } from "@/types/resume";
import { JDMatch } from "@/types/jd";
import JDInput from "@/components/features/resume/JDInput";
import MatchResult from "@/components/features/resume/MatchResult";
import { Loader2, RefreshCw } from "lucide-react";

export default function ResumeAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<"analyzer" | "jd-match">("analyzer");
  
  // Analyzer State
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  
  // JD Match State
  const [matchResult, setMatchResult] = useState<JDMatch | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<ResumeAnalysis[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Shared State
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Fetch History Function
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const data = await resumeApi.getHistory();
      setPastAnalyses(data);
    } catch (err) {
      console.error("Failed to load resume history:", err);
      // Optional: Show toast or inline error
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // 2️⃣ Load history when switching to JD Match tab
  useEffect(() => {
    if (activeTab === "jd-match") {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // 3️⃣ Optimistic Update: Add new resume to list immediately after upload
  const handleAnalysisComplete = (result: ResumeAnalysis) => {
    setAnalysis(result);
    setError(null);
    
    // Add to the dropdown list immediately so user can use it in JD Match
    setPastAnalyses(prev => [result, ...prev]);
  };

  const handleError = (message: string) => {
    setError(message);
    setAnalysis(null);
  };

  const handleJDMatch = async (jdInput: { text?: string; url?: string; title?: string }) => {
    if (!selectedResumeId) {
      setError("Please select a resume to match");
      return;
    }
    try {
      setError(null);
      const result = await jdApi.matchWithJD({ 
        resumeId: selectedResumeId, 
        jdText: jdInput.text, 
        jdTitle: jdInput.title 
      });
      setMatchResult(result);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to match with JD");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Analyzer</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Upload your resume or match it against a job description
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => { setActiveTab("analyzer"); setMatchResult(null); }}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "analyzer"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          General Analysis
        </button>
        <button
          onClick={() => { setActiveTab("jd-match"); setAnalysis(null); }}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "jd-match"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          Match with Job Description
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "analyzer" ? (
        // ✅ GENERAL ANALYSIS TAB
        !analysis ? (
          <ResumeUpload onAnalysisComplete={handleAnalysisComplete} onError={handleError} />
        ) : (
          <div className="space-y-6">
            <button onClick={() => setAnalysis(null)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              ← Analyze another resume
            </button>
            <AnalysisResult analysis={analysis} />
          </div>
        )
      ) : (
        // ✅ JD MATCHING TAB
        <div className="space-y-6">
          {!matchResult ? (
            <div className="space-y-6">
              
              {/* 🆕 RESUME SELECTOR WITH LOADING STATE */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select a resume to match
                  </label>
                  {isLoadingHistory && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    disabled={isLoadingHistory}
                    className="flex-1 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select a past analysis --</option>
                    {pastAnalyses.map((res) => (
                      <option key={res._id} value={res._id}>
                        {res.originalFilename} (Score: {res.aiScore})
                      </option>
                    ))}
                  </select>
                  
                  {/* Refresh Button */}
                  <button 
                    onClick={fetchHistory}
                    disabled={isLoadingHistory}
                    className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Refresh list"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {pastAnalyses.length === 0 && !isLoadingHistory && (
                  <p className="mt-2 text-xs text-gray-500">
                    No past analyses found. Please upload a resume in the General Analysis tab.
                  </p>
                )}
              </div>

              <JDInput 
                onMatch={handleJDMatch} 
                onError={setError}
                disabled={!selectedResumeId}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => { setMatchResult(null); setError(null); }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Match another JD
              </button>
              <MatchResult match={matchResult} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}