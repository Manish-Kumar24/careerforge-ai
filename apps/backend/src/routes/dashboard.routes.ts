// filepath: apps/backend/src/routes/dashboard.routes.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getDashboardStats } from "../controllers/dashboard.controller";

const router = Router();

// All dashboard routes protected by auth
router.use(authMiddleware);

// GET /api/dashboard/stats - Returns real-time metrics
router.get("/stats", getDashboardStats);

export default router;