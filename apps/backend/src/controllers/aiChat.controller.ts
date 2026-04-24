// filepath: apps/backend/src/controllers/aiChat.controller.ts

import { Request, Response } from "express";
import ChatSession, { IChatMessage } from "../models/ChatSession";

// ✅ FIX: Return type is string | undefined to handle missing user
const getUserId = (req: Request): string | undefined => {
  return (req.user as any)?._id || (req.user as any)?.id;
};

// ✅ FIX: Explicit return type Promise<void> for Express controllers
export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return; // ✅ Explicit return after sending response
    }

    const { initialMessage } = req.body;
    
    // Auto-generate title from the first message
    const title = initialMessage 
      ? `${initialMessage.slice(0, 30)}${initialMessage.length > 30 ? "..." : ""}` 
      : "New Chat";

    const session = await ChatSession.create({
      userId,
      title,
      messages: initialMessage ? [{ role: "user", content: initialMessage }] : []
    });

    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create session" });
  }
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Fetch only title and date for the list (exclude heavy 'messages' array)
    const sessions = await ChatSession.find({ userId })
      .select("-messages") 
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch sessions" });
  }
};

export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { sessionId } = req.params;

    const session = await ChatSession.findOne({ _id: sessionId, userId });

    if (!session) {
      res.status(404).json({ error: "Chat session not found" });
      return;
    }

    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch session" });
  }
};

export const addMessageToSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || !message.content) {
      res.status(400).json({ error: "Message content is required" });
      return;
    }

    const updatedSession = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { 
        $push: { messages: { ...message, timestamp: new Date() } },
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true }
    );

    if (!updatedSession) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add message" });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { sessionId } = req.params;

    const deleted = await ChatSession.findOneAndDelete({ _id: sessionId, userId });

    if (!deleted) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({ message: "Session deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete session" });
  }
};