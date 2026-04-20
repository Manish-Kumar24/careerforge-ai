// filepath: apps/frontend/app/interview/report/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewApi } from "@/features/interview/api";
import type { InterviewSession } from "@/types/interview";
import dynamic from "next/dynamic"; 
import ReportPDF from "@/components/features/interview/ReportPDF"; // ✅ Direct import

// ✅ Dynamic import for @react-pdf (SSR incompatible)
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-sm text-gray-500">Preparing PDF...</span> }
);

type ReportState = NonNullable<InterviewSession["report"]> | null;

export default function InterviewReport() {
  const params = useParams();
  const router = useRouter();
  
  // ✅ FIX: Explicitly type sessionId with fallback
  const rawId = params.id;
  const sessionId: string = typeof rawId === 'string' 
    ? rawId 
    : Array.isArray(rawId) 
      ? rawId[0] 
      : '';

  const [report, setReport] = useState<ReportState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!sessionId) { 
    setError("Invalid session ID");
    setLoading(false);
    return; 
  }

  interviewApi.endSession(sessionId, "user_ended")
    .then(res => {
      // ✅ DEEP VALIDATION: Ensure all nested report properties are defined
      const validateReport = (r: any) => {
        if (!r || typeof r !== 'object') return null;
        
        return {
          overallScore: typeof r.overallScore === 'number' ? r.overallScore : 0,
          categoryScores: {
            technicalAccuracy: typeof r.categoryScores?.technicalAccuracy === 'number' ? r.categoryScores.technicalAccuracy : 0,
            problemSolving: typeof r.categoryScores?.problemSolving === 'number' ? r.categoryScores.problemSolving : 0,
            communication: typeof r.categoryScores?.communication === 'number' ? r.categoryScores.communication : 0,
            codeStructure: typeof r.categoryScores?.codeStructure === 'number' ? r.categoryScores.codeStructure : 0,
          },
          perQuestionFeedback: Array.isArray(r.perQuestionFeedback) 
            ? r.perQuestionFeedback.map((q: any) => ({
                questionIndex: typeof q?.questionIndex === 'number' ? q.questionIndex : 0,
                question: typeof q?.question === 'string' ? q.question : '',
                answer: typeof q?.answer === 'string' ? q.answer : '',
                answerOriginal: typeof q?.answerOriginal === 'string' ? q.answerOriginal : '',
                feedback: typeof q?.feedback === 'string' ? q.feedback : '',
                score: typeof q?.score === 'number' ? q.score : 0,
                didNotAnswer: q?.didNotAnswer === true,
              }))
            : [],
          strengths: Array.isArray(r.strengths) ? r.strengths.filter((s: any) => typeof s === 'string') : [],
          improvements: Array.isArray(r.improvements) ? r.improvements.filter((s: any) => typeof s === 'string') : [],
          nextSteps: Array.isArray(r.nextSteps) ? r.nextSteps.filter((s: any) => typeof s === 'string') : [],
          meta: {
            hintsUsed: typeof r.meta?.hintsUsed === 'number' ? r.meta.hintsUsed : 0,
          }
        };
      };

      if (res?.report) {
        const validatedReport = validateReport(res.report);
        setReport(validatedReport);
        setError(null);
      } else {
        setError("Report data is empty");
        setReport(null);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch report:", err);
      setError("Failed to load report data");
      setReport(null);
    })
    .finally(() => setLoading(false));
}, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Generating your report...</p>
      </div>
    );
  }

  if (!report || error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            {error || "Failed to generate report. Please try again."}
          </p>
        </div>
        <button
          onClick={() => router.push("/interview")}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Back to Interviews
        </button>
      </div>
    );
  }

  const categoryEntries = Object.entries(report.categoryScores || {}) as [string, number][];

  // ✅ FIX: Add id="report-content" to outermost div for html2canvas capture
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Report</h1>
        <button
          onClick={() => router.push("/interview")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
        >
          ← Back to Hub
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Summary */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{report.overallScore}/100</div>
              </div>
              {(report as any).meta?.hintsUsed !== undefined && (report as any).meta.hintsUsed > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                  💡 Hints used: {(report as any).meta.hintsUsed}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Category Scores</h3>
            <div className="space-y-2">
              {categoryEntries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className={`text-sm font-medium ${value >= 80 ? "text-green-600" : value >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                    {value}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Strengths</h3>
            <ul className="space-y-1">
              {report.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔧 Improvements</h3>
            <ul className="space-y-1">
              {report.improvements?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Per-Question + PDF */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Per-Question Feedback</h3>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
            {report.perQuestionFeedback?.map((q: any) => (
              <div key={q.questionIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-gray-900 dark:text-white">Q{q.questionIndex}: {q.question}</div>
                  {q.didNotAnswer && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded whitespace-nowrap">
                      🚫 No answer
                    </span>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">{q.feedback}</div>
                {(q.answerOriginal || q.answer) && (
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                      View your answer
                    </summary>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                      {q.answerOriginal || q.answer}
                    </pre>
                  </details>
                )}
                <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                  Score: <span className="font-medium">{q.score}/100</span>
                </div>
              </div>
            ))}
          </div>

                                                  {/* ✅ FIX: Client-side PDF using @react-pdf/renderer */}
          <div className="mt-4 pt-4 border-t flex justify-end">
            {typeof window !== "undefined" && report && sessionId && (
              <PDFDownloadLink
                document={<ReportPDF report={report} sessionId={sessionId} />}
                fileName={`interview-report-${sessionId.slice(-8)}.pdf`}
              >
                {/* @ts-ignore: PDFDownloadLink children type not exported by @react-pdf */}
                {(props: any) => {
                  const { loading: pdfLoading, error: pdfError } = props;
                  
                  if (pdfLoading) {
                    return (
                      <span className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed">
                        Generating PDF...
                      </span>
                    );
                  }
                  if (pdfError) {
                    return (
                      <span className="px-4 py-2 bg-red-100 text-red-700 rounded">
                        PDF Error: {pdfError.message}
                      </span>
                    );
                  }
                  return (
                    <span className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition-colors">
                      📄 Download Report (PDF)
                    </span>
                  );
                }}
              </PDFDownloadLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}