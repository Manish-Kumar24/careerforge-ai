// filepath: apps/frontend/app/interview/session/[id]/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewApi } from "@/features/interview/api";
import { useAutoSave } from "@/features/interview/hooks/useAutoSave";

type ChatMsg = { role: "ai" | "user" | "hint" | "system"; content: string; id: string };

export default function InterviewSession() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [answer, setAnswer] = useState("");
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [session, setSession] = useState<any>(null);

  const chatEnd = useRef<HTMLDivElement>(null);

  // Auto-save hook
  const { lastSaved, isSaving, saveError, forceSave } = useAutoSave({
    sessionId,
    conversation: messages.map(m => ({ role: m.role, content: m.content })),
    enabled: !ended
  });

  // ✅ FIX: Fetch real session data from backend on mount
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        // Fetch session state from backend
        const session = await interviewApi.getSessionById(sessionId);
        setSession(session);

        // Populate messages from conversation history
        if (session.conversation?.length > 0) {
          setMessages(session.conversation.map((c: any) => ({
            role: c.role,
            content: c.content,
            id: c._id || c.timestamp || Date.now().toString()
          })));
        }
        // Fallback: use firstQuestion if conversation is empty (new session)
        else if (session.firstQuestion) {
          setMessages([
            {
              role: "system",
              content: `Session: ${session.type} • ${session.difficulty} • ${session.durationMinutes}min${session.companyTag ? ` • ${session.companyTag}` : ''}`,
              id: "init"
            },
            { role: "ai", content: session.firstQuestion, id: "q1" }
          ]);
        }

        // Set timer from backend-calculated remaining time
        if (session.remainingSeconds !== null && session.remainingSeconds > 0) {
          setTimerSeconds(session.remainingSeconds);
        }
        // Fallback: calculate client-side from startTime + duration
        else if (session.startTime && session.durationMinutes) {
          const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
          const remaining = session.durationMinutes * 60 - elapsed;
          setTimerSeconds(Math.max(0, remaining));
        }

      } catch (err: any) {
        console.warn("Failed to fetch session (using fallback):", err);
        // Graceful fallback: show error message instead of infinite loading
        setMessages([
          { role: "system", content: "Session initialized", id: "init" },
          {
            role: "ai",
            content: "⚠️ Could not load question. Please try refreshing or starting a new session.",
            id: "q1"
          }
        ]);
        setError(err.message || "Failed to load session");
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer countdown
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0 || ended) return;
    const t = setInterval(() => setTimerSeconds(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(t);
  }, [timerSeconds, ended]);

  useEffect(() => {
    if (timerSeconds === 0 && !ended) handleEnd("time_expired");
  }, [timerSeconds]);

  const handleEnd = useCallback(async (reason?: "user_ended" | "time_expired") => {
  if (ended) return;
  setEnded(true);
  try {
    const response = await interviewApi.endSession(sessionId, reason);
    
    // ✅ FIX: Redirect to the correct loop dashboard if this was a loop round
    if (response.loopId) {
      router.replace(`/interview/loop/${response.loopId}`);
    } else {
      router.replace(`/interview/report/${sessionId}`);
    }
  } catch (err) {
    console.error("End session error:", err);
    // Fallback: still redirect to report
    router.replace(`/interview/report/${sessionId}`);
  }
}, [sessionId, ended, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || loading) return;
    setLoading(true); setError(null);
    const userMsg = answer;
    setAnswer("");
    setMessages(prev => [...prev, { role: "user", content: userMsg, id: Date.now().toString() }]);

    try {
      const res = await interviewApi.submitAnswer(sessionId, userMsg);
      setMessages(prev => [...prev, { role: "ai", content: res.nextQuestion, id: Date.now().toString() }]);
      if (res.remainingSeconds !== null) setTimerSeconds(res.remainingSeconds);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit");
      setMessages(prev => prev.slice(0, -1));
      setAnswer(userMsg);
    } finally { setLoading(false); }
  };

  const askHint = async () => {
    if (hintLoading) return;
    setHintLoading(true);
    try {
      const { hint } = await interviewApi.requestHint(sessionId);
      setMessages(prev => [...prev, { role: "hint", content: `💡 ${hint}`, id: Date.now().toString() }]);
    } catch (err: any) { setError(err.response?.data?.error || "Failed to get hint"); }
    finally { setHintLoading(false); }
  };

  const fmt = (s: number | null) => s === null ? "--:--" : `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const timeColor = timerSeconds !== null && timerSeconds < 300 ? "text-red-600 dark:text-red-400 animate-pulse" : "text-gray-900 dark:text-white";

  // ✅ FIX: Proper contrast classes for light/dark mode
  const getBubbleClasses = (role: ChatMsg["role"]) => {
    switch (role) {
      case "ai":
        return "bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100 border border-blue-200 dark:border-blue-800";
      case "user":
        return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900";
      case "hint":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-800 italic";
      case "system":
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-gray-900">
      {/* Header: Timer + Actions */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-gray-700">
        <span className={`text-xl font-mono font-bold ${timeColor}`}>⏱️ {fmt(timerSeconds)}</span>
        <button
          onClick={() => handleEnd("user_ended")}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
        >
          End Interview
        </button>
      </div>

      {/* Session Metadata */}
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
  Session: {session?.type || "DSA"} • {session?.difficulty || "MEDIUM"} • {session?.durationMinutes || 45}min
  {session?.companyTag && ` • ${session?.companyTag}`}
</div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Auto-save indicator */}
      {saveError && (
        <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-300">
          ⚠️ {saveError}
        </div>
      )}
      {lastSaved && !isSaving && (
        <div className="mb-2 text-xs text-gray-400 dark:text-gray-500">
          💾 Saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-1">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${getBubbleClasses(m.role)}`}>
              {m.role === "ai" && <span className="font-semibold block mb-1 text-blue-700 dark:text-blue-300">🤖 Interviewer</span>}
              {m.role === "user" && <span className="font-semibold block mb-1 text-right text-gray-200 dark:text-gray-800">👤 You</span>}
              {m.role === "hint" && <span className="font-semibold block mb-1 text-yellow-700 dark:text-yellow-300">💡 Hint</span>}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        <div ref={chatEnd} />
      </div>

      {/* Input Area */}
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={4}
          disabled={loading || ended}
          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={askHint}
            disabled={hintLoading || loading || ended}
            className="px-4 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 rounded disabled:opacity-50 transition-colors"
          >
            {hintLoading ? "Asking..." : "💡 Hint"}
          </button>
          <button
            type="submit"
            disabled={loading || !answer.trim() || ended}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      </form>
    </div>
  );
}