// apps/backend/src/routes/jd.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  matchWithJD,
  getMatchHistory,
  getMatchById,
} from "../controllers/jd.controller";

const router = Router();

// All JD routes require authentication
router.use(authMiddleware);

router.post("/match", matchWithJD);
router.get("/history", getMatchHistory);
router.get("/:id", getMatchById);

export default router;