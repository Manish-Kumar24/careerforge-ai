// filepath: apps/backend/src/routes/interview.routes.ts

import express from "express";
import { getInterviews, createInterview, deleteInterview, updateInterview } from "../controllers/interview.controller";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, getInterviews);
router.post("/", authMiddleware, createInterview);
router.put("/:id", authMiddleware, updateInterview);
router.delete("/:id", authMiddleware, deleteInterview);

export default router;