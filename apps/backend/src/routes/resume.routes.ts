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

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/history", getAnalysisHistory);
router.get("/:id", getAnalysisById);

export default router;