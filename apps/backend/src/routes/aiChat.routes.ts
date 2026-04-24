// filepath: apps/backend/src/routes/aiChat.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createSession,
  getSessions,
  getSessionById,
  addMessageToSession,
  deleteSession
} from "../controllers/aiChat.controller";

const router = Router();

// All routes are protected
router.use(authMiddleware);

// CRUD Operations
router.post("/", createSession);           // Create new chat
router.get("/", getSessions);              // Get list for sidebar
router.get("/:sessionId", getSessionById); // Get full history
router.post("/:sessionId/message", addMessageToSession); // Append message
router.delete("/:sessionId", deleteSession); // Delete chat

export default router;