// filepath: apps/backend/src/routes/application.routes.ts

import express from "express";
import { authMiddleware } from "../middleware/auth";

import {
    createApplication,
    getApplications,
    updateApplication,
    deleteApplication,
    togglePriority,
    addTimelineEntry,  // ✅ New controller function for timeline entries
} from "../controllers/application.controller";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createApplication);
router.get("/", getApplications);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.patch("/:id/priority", togglePriority);  // ✅ New route
router.post("/:id/timeline", addTimelineEntry);  // ✅ New route for adding timeline entries

export default router;