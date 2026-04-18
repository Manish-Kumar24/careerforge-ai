// apps/backend/src/routes/mockInterview.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "express-rate-limit";
import {
  startPracticeSession,
  createInterviewLoop,
  startLoopRound,
  submitAnswer,
  requestHint,
  endSession,
  getInterviewHistory,
  getLoopHistory,
  getDashboardStats,
  getLoopById, 
  getSessionById,
} from "../controllers/mockInterview.controller"; 

const router = Router();

// All routes protected
router.use(authMiddleware);

// Rate limiters (cost + abuse control)
const practiceLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: "Too many practice sessions. Try again later." } 
});
const loopLimiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: { error: "Max 3 interview loops per hour." } 
});
const answerLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 40, 
  message: { error: "Rate limit exceeded. Please slow down." } 
});
const hintLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 8, 
  message: { error: "Too many hints requested." } 
});

// Practice mode
router.post("/practice", practiceLimiter, startPracticeSession);

// Loop mode
router.post("/loop", loopLimiter, createInterviewLoop);
router.post("/loop/:loopId/round/:roundNumber/start", startLoopRound);

// Shared session endpoints
router.post("/session/:id/answer", answerLimiter, submitAnswer);
router.post("/session/:id/hint", hintLimiter, requestHint);
router.post("/session/:id/end", endSession);

// Dashboard & history
router.get("/history", getInterviewHistory);
router.get("/loops", getLoopHistory);
router.get("/dashboard/stats", getDashboardStats);

// ✅ NEW: Fetch single loop by ID (for loop dashboard)
router.get("/loop/:id", authMiddleware, getLoopById);
router.get("/session/:id", authMiddleware, getSessionById);

export default router;