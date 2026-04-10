// src/routes/resume.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  uploadResume,
  getAnalysisHistory,
  getAnalysisById,
} from "../controllers/resume.controller";

const router = Router();

// All routes protected by auth
router.use(authMiddleware);

// ✅ Explicitly type handlers to avoid overload errors
router.post("/upload", upload.single("resume"), uploadResume as any);
router.get("/history", getAnalysisHistory as any);
router.get("/:id", getAnalysisById as any);

export default router;