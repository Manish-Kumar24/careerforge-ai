// filepath: apps/frontend/app/interview/loop/[id]/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewApi } from "@/features/interview/api";
import { InterviewLoop } from "@/types/interview";
import { Clock, Play, CheckCircle, Lock, Calendar, RefreshCw } from "lucide-react";

// ✅ FIX: Explicitly type Round with correct status union
type Round = {
  roundNumber: number;
  type: InterviewLoop["rounds"][0]["type"];
  difficulty: InterviewLoop["rounds"][0]["difficulty"];
  durationMinutes: InterviewLoop["rounds"][0]["durationMinutes"];
  scheduledDate: string;
  sessionId?: string;
  status: "scheduled" | "completed" | "skipped";
};

export default function LoopDashboard() {
  const params = useParams();
  const router = useRouter();
  const loopId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [loop, setLoop] = useState<InterviewLoop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingRound, setStartingRound] = useState<number | null>(null);
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchLoop = useCallback(async () => {
    if (!loopId) {
      setError("Invalid loop ID");
      setLoading(false);
      return;
    }
    try {
      const loopData = await interviewApi.getLoopById(loopId);
      
      // ✅ DEBUG: Log round statuses and scheduledDates (proper comment syntax)
      console.log("🔍 DEBUG: Loop rounds:", loopData.rounds.map((r: any) => ({
        round: r.roundNumber,
        status: r.status,
        scheduledDate: r.scheduledDate
      })));
      
      setLoop(loopData);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error("Failed to fetch loop:", err);
      if (err.response?.status === 404) {
        setError("Interview loop not found. It may have been deleted.");
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else {
        setError(err.response?.data?.error || "Failed to load interview loop");
      }
    } finally {
      setLoading(false);
    }
  }, [loopId]);

  useEffect(() => {
    fetchLoop();
  }, [fetchLoop]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (loop?.status !== "completed") {
        fetchLoop();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLoop, loop?.status]);

  // Real-time countdown (ticks every second)
  useEffect(() => {
    if (!loop) return;
    
    const updateCountdowns = () => {
      const now = new Date();
      const newCountdowns: Record<number, string> = {};
      
      loop.rounds.forEach((round: Round) => {
        if (round.status === "scheduled") {
          // ✅ Use stored scheduledDate directly from API (never recalculate)
          const scheduled = new Date(round.scheduledDate);
          const diffMs = scheduled.getTime() - now.getTime();
          
          if (diffMs <= 0) {
            newCountdowns[round.roundNumber] = "Available now";
          } else {
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (days > 0) {
              newCountdowns[round.roundNumber] = `${days}d ${hours}h`;
            } else if (hours > 0) {
              newCountdowns[round.roundNumber] = `${hours}h ${minutes}m`;
            } else {
              newCountdowns[round.roundNumber] = `${minutes}m`;
            }
          }
        }
      });
      
      setCountdowns(newCountdowns);
    };
    
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [loop]);

  const startRound = useCallback(async (roundNumber: number) => {
    setStartingRound(roundNumber);
    try {
      const { sessionId } = await interviewApi.startLoopRound(loopId, roundNumber);
      setLoop(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rounds: prev.rounds.map(r => 
            r.roundNumber === roundNumber ? { ...r, status: "scheduled" as const } : r
          ),
          status: "in_progress"
        };
      });
      router.push(`/interview/session/${sessionId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start round");
    } finally {
      setStartingRound(null);
    }
  }, [loopId, router]);

  // ✅ FIX: Only check valid round statuses
  const isRoundAvailable = (round: Round): boolean => {
    if (round.status !== "scheduled") return false;
    const scheduled = new Date(round.scheduledDate);
    const now = new Date();
    return now.getTime() >= scheduled.getTime() - 60 * 60 * 1000;
  };

  // ✅ FIX: Only use valid round status values
  const getRoundStatusIcon = (round: Round) => {
    if (round.status === "completed") return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isRoundAvailable(round)) return <Play className="h-5 w-5 text-blue-500" />;
    return <Lock className="h-5 w-5 text-gray-400" />;
  };

  // ✅ FIX: Button logic with correct status checks
  const getRoundActionButton = (round: Round) => {
    const isCurrent = startingRound === round.roundNumber;
    
    if (round.status === "completed") {
      return (
        <button
          onClick={() => round.sessionId && router.push(`/interview/report/${round.sessionId}`)}
          className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1"
          disabled={!round.sessionId}
        >
          <CheckCircle className="w-4 h-4" /> View Report
        </button>
      );
    }
    
    if (isRoundAvailable(round)) {
      return (
        <button
          onClick={() => startRound(round.roundNumber)}
          disabled={isCurrent}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
            isCurrent
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isCurrent ? "Starting..." : <><Play className="w-4 h-4" /> Start Round</>}
        </button>
      );
    }
    
    return (
      <span className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-not-allowed flex items-center gap-1">
        <Lock className="w-4 h-4" /> Locked
      </span>
    );
  };

  if (loading && !loop) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading interview loop...</p>
      </div>
    );
  }

  if (error || !loop) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {error || "Interview loop not found"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/interview/loop/setup")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            ← Create New Loop
          </button>
          <button
            onClick={() => router.push("/interview")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {loop.company} • {loop.role}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Loop ID: {loop._id}
              {lastRefreshed && (
                <span className="ml-2 text-xs text-gray-400">
                  • Updated: {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              loop.status === "completed" ? "bg-green-100 text-green-700" :
              loop.status === "in_progress" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {loop.status.replace("_", " ").toUpperCase()}
            </span>
            <button
              onClick={fetchLoop}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Rounds Timeline */}
      <div className="space-y-4">
        {loop.rounds.map((round: Round) => {
          const available = isRoundAvailable(round);
          
          return (
            <div
              key={round.roundNumber}
              className={`p-4 border rounded-xl transition-all ${
                round.status === "completed"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : available
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-md"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Round Number Badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    round.status === "completed" ? "bg-green-500 text-white" :
                    available ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}>
                    {getRoundStatusIcon(round)}
                  </div>

                  {/* Round Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Round {round.roundNumber}: {round.type.replace("_", " / ")}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{round.durationMinutes} minutes • {round.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {round.status === "completed" 
                            ? "Completed" 
                            : (countdowns[round.roundNumber] as string) || "Calculating..."}
                        </span>
                      </div>
                      {round.status === "scheduled" && !available && (
                        <p className="text-xs text-gray-400 mt-1">
                          Unlocks on {new Date(round.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  {getRoundActionButton(round)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-between items-center">
        <button
          onClick={() => router.push("/interview")}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Dashboard
        </button>
        {loop.status === "completed" && (
          <button
            onClick={() => router.push(`/interview/report/${loop._id}`)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
          >
            View Loop Summary Report
          </button>
        )}
      </div>
    </div>
  );
}