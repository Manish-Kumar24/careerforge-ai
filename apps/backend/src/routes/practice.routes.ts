// apps\backend\src\routes\practice.routes.ts

import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getProblems,
  getProblemById,
  updateProgress,
  getProgressSummary,
  getFilterOptions,
  startTimer,
  toggleTimer,
  resetTimer,
  getRemainingTime,
  toggleBookmark,
} from "../controllers/practice.controller";

const router = express.Router();

// ✅ FIX: Apply auth middleware to ALL practice routes (they all require userId)
router.use(authMiddleware);

// All routes now require authentication
router.get("/", getProblems);
router.get("/filters", getFilterOptions);
router.get("/summary", getProgressSummary);
router.get("/:id", getProblemById);
router.patch("/:id/progress", updateProgress);

// Timer routes
router.post("/:id/timer/start", startTimer);
router.patch("/:id/timer/toggle", toggleTimer);
router.delete("/:id/timer", resetTimer);
router.get("/:id/timer", getRemainingTime);

// Bookmark route
router.patch("/:id/bookmark", toggleBookmark);

export default router;