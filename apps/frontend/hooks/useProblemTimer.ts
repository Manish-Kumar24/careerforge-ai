"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getProblemTimer } from "@/features/practice/api";
import { TimerResponse } from "@/types/practice";

interface TimerState extends TimerResponse {
  isLoading: boolean;
}

export function useProblemTimer(problemId: string, autoFetch = true) {
  const [timer, setTimer] = useState<TimerState>({
    remainingSeconds: null,
    targetSeconds: 0,
    isRunning: false,
    isExpired: false,
    isLoading: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef<Set<string>>(new Set());

  // ✅ FIX: Use a stable ref for fetchTimer to avoid dependency loop
  // ✅ FIX: Explicit undefined initial value for TypeScript compatibility
  const fetchTimerRef = useRef<() => Promise<void> | undefined>(undefined);

  const fetchTimer = useCallback(async () => {
    if (!problemId) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (inFlightRef.current.has(problemId)) {
      return;
    }
    inFlightRef.current.add(problemId);
    
    abortControllerRef.current = new AbortController();
    
    setTimer(prev => ({ ...prev, isLoading: true }));
    try {
      // ✅ FIX: Correct variable declaration
      const data: TimerResponse = await getProblemTimer(problemId);
      
      setTimer(prev => ({
        ...prev,
        remainingSeconds: data.remainingSeconds,
        targetSeconds: data.targetSeconds,
        isRunning: data.isRunning,
        isExpired: data.isExpired,
        isLoading: false,
      }));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Failed to fetch timer:", err);
      }
      setTimer(prev => ({ ...prev, isLoading: false }));
    } finally {
      inFlightRef.current.delete(problemId);
    }
  }, [problemId]);

  // ✅ FIX: Update ref whenever fetchTimer changes
  useEffect(() => {
    fetchTimerRef.current = fetchTimer;
  }, [fetchTimer]);

  // Countdown effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!timer.isRunning || timer.remainingSeconds === null || timer.isExpired) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev.remainingSeconds === null || prev.remainingSeconds <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return { ...prev, isExpired: true, isRunning: false, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.isRunning, timer.isExpired, timer.remainingSeconds]);

  // ✅ FIX: Auto-fetch using ref to avoid dependency loop
  useEffect(() => {
    if (autoFetch && problemId && fetchTimerRef.current) {
      fetchTimerRef.current();
    }
  }, [problemId, autoFetch]); // ✅ Removed fetchTimer from deps

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (problemId) {
        inFlightRef.current.delete(problemId);
      }
    };
  }, [problemId]);

  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getColor = useCallback(() => {
    if (timer.remainingSeconds === null) return "text-gray-400";
    if (timer.isExpired) return "text-red-500 font-bold animate-pulse";
    
    const percent = timer.targetSeconds > 0 
      ? (timer.remainingSeconds / timer.targetSeconds) * 100 
      : 0;
    
    if (percent <= 25) return "text-red-500";
    if (percent <= 50) return "text-yellow-500";
    return "text-green-500";
  }, [timer.remainingSeconds, timer.targetSeconds, timer.isExpired]);

  return {
    ...timer,
    formattedTime: formatTime(timer.remainingSeconds),
    colorClass: getColor(),
    fetchTimer,
  };
}