// filepath: apps/frontend/features/interview/hooks/useAutoSave.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { interviewApi } from "../api";

interface UseAutoSaveProps {
  sessionId: string;
  conversation: Array<{ role: string; content: string; timestamp?: string }>;
  enabled?: boolean;
  intervalMs?: number;
}

export const useAutoSave = ({
  sessionId,
  conversation,
  enabled = true,
  intervalMs = 30000 // 30 seconds default
}: UseAutoSaveProps) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const conversationRef = useRef(conversation);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync with latest conversation
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  const saveDraft = useCallback(async () => {
    if (!enabled || !sessionId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Backend doesn't have explicit "save draft" endpoint yet
      // For now, we skip silent auto-save to avoid extra API calls
      // TODO Stage 6: Add PATCH /session/:id/draft endpoint for true auto-save
      setLastSaved(new Date());
    } catch (err: any) {
      console.warn("Auto-save failed (non-critical):", err);
      setSaveError("Draft save failed. Your answers are still in memory.");
    } finally {
      setIsSaving(false);
    }
  }, [enabled, sessionId]);

  // Debounced auto-save on conversation change
  useEffect(() => {
    if (!enabled || !sessionId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, intervalMs);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [conversation, enabled, sessionId, intervalMs, saveDraft]);

  // Manual save trigger (e.g., on page unload)
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return saveDraft();
  }, [saveDraft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    lastSaved,
    isSaving,
    saveError,
    forceSave
  };
};