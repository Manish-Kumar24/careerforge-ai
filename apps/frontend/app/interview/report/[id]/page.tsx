// filepath: apps/frontend/app/interview/report/[id]/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewApi } from "@/features/interview/api";
import type { InterviewSession } from "@/types/interview";

type ReportState = NonNullable<InterviewSession["report"]> | null;

export default function InterviewReport() {
  const [report, setReport] = useState<ReportState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const router = useRouter();

  const rawId = params.id;
  const sessionId: string =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : "";

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session ID");
      setLoading(false);
      return;
    }

    interviewApi
      .endSession(sessionId, "user_ended")
      .then((res) => {
        if (res?.report) {
          setReport(res.report);
          setError(null);
        } else {
          setError("Report data is empty");
        }
      })
      .catch(() => {
        setError("Failed to load report data");
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (!report) return;

    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);

        const res = await fetch("http://localhost:5000/api/ai-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ report }),
        });

        if (!res.ok) throw new Error("Failed API");

        const data: { summary: string } = await res.json();

        setAiSummary(data.summary || "");
      } catch (err) {
        console.error("AI Summary error:", err);
        setAiSummary("");
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [report]);

  // ✅ CLEAN PDF GENERATION (NO REACT-PDF)
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff", // ✅ force safe background
      onclone: (doc) => {
        // ✅ REMOVE unsupported color functions
        const all = doc.querySelectorAll("*");

        all.forEach((el: any) => {
          const style = window.getComputedStyle(el);

          // Replace problematic colors
          if (style.color?.includes("lab") || style.color?.includes("oklch")) {
            el.style.color = "#000000";
          }

          if (style.backgroundColor?.includes("lab") || style.backgroundColor?.includes("oklch")) {
            el.style.backgroundColor = "#ffffff";
          }
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 295;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // ✅ MULTI-PAGE SUPPORT
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`interview-report-${sessionId.slice(-8)}.pdf`);
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <p>Generating report...</p>
      </div>
    );
  }

  if (!report || error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/interview")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* ✅ THIS DIV WILL BE EXPORTED TO PDF */}
      <div
        ref={reportRef}
        className="bg-white text-black p-8 max-w-4xl mx-auto"
        style={{ backgroundColor: "#ffffff", color: "#000000" }}
      >
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Interview Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Session ID: {sessionId}
          </p>
        </div>

        {/* SCORE */}
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500">Overall Score</p>
          <p className="text-5xl font-bold text-blue-600">
            {report.overallScore}/100
          </p>
        </div>

        {/* 🤖 AI SUMMARY */}
        <div className="mb-10 border rounded-lg p-5 bg-purple-50">
          <h2 className="text-lg font-semibold mb-2">
            🤖 AI Interview Feedback
          </h2>

          {loadingSummary ? (
            <p className="text-sm text-gray-500">
              Generating AI insights...
            </p>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {aiSummary || "AI feedback not available."}
            </p>
          )}
        </div>

        {/* CATEGORY SCORES */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Category Scores</h2>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(report.categoryScores || {}).map(([key, value]) => (
              <div
                key={key}
                className="border rounded-lg p-4 shadow-sm"
              >
                <p className="text-sm text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-xl font-semibold mt-1">
                  {value}/100
                </p>

                {/* progress bar */}
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STRENGTHS & IMPROVEMENTS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Strengths */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-green-600 mb-2">
              Strengths
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {report.strengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-yellow-600 mb-2">
              Improvements
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {report.improvements?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* QUESTIONS */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Per Question Feedback
          </h2>

          <div className="space-y-5">
            {report.perQuestionFeedback?.map((q) => (
              <div
                key={q.questionIndex}
                className="border rounded-lg p-4 shadow-sm"
              >
                {/* QUESTION */}
                <div className="flex justify-between items-start">
                  <p className="font-semibold">
                    Q{q.questionIndex}: {q.question}
                  </p>

                  <span className="text-xs px-2 py-1 rounded bg-gray-100">
                    {q.score}/100
                  </span>
                </div>

                {/* FEEDBACK */}
                <p className="text-sm text-green-700 mt-2">
                  {q.feedback}
                </p>

                {/* ANSWER */}
                {(q.answer || q.answerOriginal) && (
                  <div className="mt-3 bg-gray-100 p-3 rounded text-xs">
                    <p className="font-medium mb-1">Your Answer:</p>
                    <pre className="whitespace-pre-wrap font-mono">
                      {q.answerOriginal || q.answer}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ DOWNLOAD BUTTON */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          📄 Download PDF
        </button>
      </div>
    </div>
  );
}