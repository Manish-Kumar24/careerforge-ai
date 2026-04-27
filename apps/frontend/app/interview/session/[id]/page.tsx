// filepath: apps/frontend/app/interview/session/[id]/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewApi } from "@/features/interview/api";
import { useAutoSave } from "@/features/interview/hooks/useAutoSave";
import { Mic, MicOff, Volume2, Pause, Square } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

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

  // ✅ STT + TTS State
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  // ✅ Default to true so mic doesn't auto-start on load
  const [isManuallyStopped, setIsManuallyStopped] = useState(true); 

  // ✅ STT + TTS Hooks
  const {
    isListening,
    transcript,
    error: sttError,
    start: startListening,
    stop: stopListening,
    isSupported: sttSupported
  } = useSpeechRecognition();

  const {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    cancel
  } = useSpeechSynthesis();

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
        const session = await interviewApi.getSessionById(sessionId);
        setSession(session);
        if (session.conversation?.length > 0) {
          setMessages(session.conversation.map((c: any) => ({
            role: c.role,
            content: c.content,
            id: c._id || c.timestamp || Date.now().toString()
          })));
        } else if (session.firstQuestion) {
          setMessages([
            { role: "system", content: `Session: ${session.type} • ${session.difficulty} • ${session.durationMinutes}min${session.companyTag ? ` • ${session.companyTag}` : ''}`, id: "init" },
            { role: "ai", content: session.firstQuestion, id: "q1" }
          ]);
        }
        if (session.remainingSeconds !== null && session.remainingSeconds > 0) {
          setTimerSeconds(session.remainingSeconds);
        } else if (session.startTime && session.durationMinutes) {
          const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
          const remaining = session.durationMinutes * 60 - elapsed;
          setTimerSeconds(Math.max(0, remaining));
        }
      } catch (err: any) {
        console.warn("Failed to fetch session:", err);
        setMessages([
          { role: "system", content: "Session initialized", id: "init" },
          { role: "ai", content: "⚠️ Could not load question.", id: "q1" }
        ]);
        setError(err.message || "Failed to load session");
      }
    };
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ FIXED: Sync speech-to-text (REPLACE instead of Append)
  useEffect(() => {
    if (!transcript || !isListening) return;
    setAnswer(transcript);
  }, [transcript, isListening]);

  // ✅ AUTO-RESTART MIC: Only restart if user HAD started it (isManuallyStopped is false)
  useEffect(() => {
    // If mic is NOT listening, AND user didn't manually stop it, AND session is active...
    if (!isListening && !isManuallyStopped && !ended && !loading) {
      // Restart the mic after a short delay
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, isManuallyStopped, ended, loading, startListening]);

  // Timer countdown
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0 || ended) return;
    const t = setInterval(() => setTimerSeconds(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(t);
  }, [timerSeconds, ended]);

  useEffect(() => {
    if (timerSeconds === 0 && !ended) handleEnd("time_expired");
  }, [timerSeconds]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancel();
      stopListening();
      setActiveSpeakingId(null);
    };
  }, [cancel, stopListening]);

  const handleEnd = useCallback(async (reason?: "user_ended" | "time_expired") => {
    if (ended) return;
    setEnded(true);
    setIsManuallyStopped(true); // Ensure mic stays off
    stopListening();
    try {
      const response = await interviewApi.endSession(sessionId, reason);
      if (response.loopId) {
        router.replace(`/interview/loop/${response.loopId}`);
      } else {
        router.replace(`/interview/report/${sessionId}`);
      }
    } catch (err) {
      router.replace(`/interview/report/${sessionId}`);
    }
  }, [sessionId, ended, router, stopListening]);

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

  // TTS Handler
  const handleSpeak = useCallback((text: string, msgId: string) => {
    if (!text) return;
    if (isSpeaking && activeSpeakingId === msgId) {
      if (isPaused) { resume(); } else { pause(); }
    } else {
      cancel();
      setActiveSpeakingId(msgId);
      speak(text);
    }
  }, [isSpeaking, isPaused, activeSpeakingId, speak, pause, resume, cancel]);

  // ✅ Mic Toggle: Start/Stop + Auto-Submit
  const handleMicToggle = useCallback(async () => {
    if (isListening) {
      // USER CLICKED STOP
      setIsManuallyStopped(true);
      stopListening();
      
      // Auto-Submit if there is text
      if (answer.trim() && !loading && !ended) {
        setLoading(true);
        try {
          const userMsg = answer.trim();
          setAnswer("");
          setMessages(prev => [...prev, { role: "user", content: userMsg, id: `user-${Date.now()}` }]);
          const res = await interviewApi.submitAnswer(sessionId, userMsg);
          setMessages(prev => [...prev, { role: "ai", content: res.nextQuestion, id: `ai-${Date.now()}` }]);
          if (res.remainingSeconds !== null) setTimerSeconds(res.remainingSeconds);
        } catch (err: any) {
          setMessages(prev => prev.slice(0, -1));
          setAnswer(answer);
          setError(err.response?.data?.error || "Failed to submit");
        } finally {
          setLoading(false);
        }
      }
    } else {
      // USER CLICKED START
      setIsManuallyStopped(false); // Allow auto-restart if browser drops connection
      setAnswer(""); // Clear previous answer for new dictation
      startListening();
    }
  }, [isListening, answer, loading, ended, sessionId, stopListening, startListening]);

  const fmt = (s: number | null) => s === null ? "--:--" : `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const timeColor = timerSeconds !== null && timerSeconds < 300 ? "text-red-600 dark:text-red-400 animate-pulse" : "text-gray-900 dark:text-white";

  const getBubbleClasses = (role: ChatMsg["role"]) => {
    switch (role) {
      case "ai": return "bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100 border border-blue-200 dark:border-blue-800";
      case "user": return "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900";
      case "hint": return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-800 italic";
      case "system": return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs";
      default: return "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-gray-700">
        <span className={`text-xl font-mono font-bold ${timeColor}`}>⏱️ {fmt(timerSeconds)}</span>
        <button onClick={() => handleEnd("user_ended")} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
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
        {messages.map(m => {
          if (m.role === "ai") {
            return (
              <div key={m.id} className="flex justify-start">
                <div className={`max-w-[85%] p-3 rounded-lg text-sm relative ${getBubbleClasses(m.role)}`}>
                  <span className="font-semibold block mb-1 text-blue-700 dark:text-blue-300">🤖 Interviewer</span>
                  <button
                    type="button"
                    onClick={() => handleSpeak(m.content, m.id)}
                    disabled={!m.content}
                    className={`absolute top-2 right-2 p-1.5 rounded-md transition-colors ${activeSpeakingId === m.id ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"} disabled:opacity-40`}
                    title={activeSpeakingId === m.id ? (isPaused ? "Resume" : "Pause") : "Listen to question"}
                  >
                    {activeSpeakingId === m.id ? (isPaused ? <Volume2 className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />) : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <p className="whitespace-pre-wrap pr-6">{m.content}</p>
                  {activeSpeakingId === m.id && (
                    <button type="button" onClick={() => { cancel(); setActiveSpeakingId(null); }} className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
                      <Square className="w-3 h-3" /> Stop Reading
                    </button>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${getBubbleClasses(m.role)}`}>
                {m.role === "user" && <span className="font-semibold block mb-1 text-right text-gray-200 dark:text-gray-800">👤 You</span>}
                {m.role === "hint" && <span className="font-semibold block mb-1 text-yellow-700 dark:text-yellow-300">💡 Hint</span>}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={chatEnd} />
      </div>

      {/* Input Area */}
      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder={isListening ? "Listening... Click mic to stop & submit" : "Type or dictate your answer..."}
            rows={4}
            disabled={loading || ended}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isListening ? "border-red-400 ring-2 ring-red-400/20" : ""}`}
          />
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={!sttSupported || loading || ended}
            className={`absolute right-3 top-3 p-2 rounded-full transition-all ${isListening ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"} disabled:opacity-40`}
            title={isListening ? "Stop listening & submit" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
        {!sttSupported && <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center -mt-2">⚠️ Voice input not supported. Try Chrome/Edge.</p>}
        
        <div className="flex gap-2">
          <button type="button" onClick={askHint} disabled={hintLoading || loading || ended} className="px-4 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 rounded disabled:opacity-50 transition-colors">
            {hintLoading ? "Asking..." : "💡 Hint"}
          </button>
          <button type="submit" disabled={loading || !answer.trim() || ended || isListening} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded disabled:opacity-50 transition-colors">
            {loading ? "Submitting..." : isListening ? "Listening..." : "Submit Answer"}
          </button>
        </div>
      </form>
    </div>
  );
}