// filepath: apps/backend/src/routes/ai.routes.ts

import express from "express";
import { askAI } from "../controllers/ai.controller";

const router = express.Router();

router.post("/", askAI);

export default router;