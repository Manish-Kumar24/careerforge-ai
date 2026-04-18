// filepath: apps/backend/src/routes/auth.routes.ts

import express from "express";
import { authMiddleware } from "../middleware/auth"
import { signup, login, getMe } from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

export default router;