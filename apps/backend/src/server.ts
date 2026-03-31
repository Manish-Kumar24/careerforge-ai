// filepath: apps/backend/src/server.ts

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";

import authRoutes from "./routes/auth.routes";
import aiRoutes from "./routes/ai.routes";
import interviewRoutes from "./routes/interview.routes";
import applicationRoutes from "./routes/application.routes";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/applications", applicationRoutes);

app.listen(5000, () => console.log("Server running on 5000"));