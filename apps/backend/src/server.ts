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

// ✅ UPDATED CORS: Allow Vercel frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://careerforge-ai-frontend-omega.vercel.app",  // ✅ Your Vercel URL
      /\.vercel\.app$/,  // ✅ All Vercel preview deployments
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/applications", applicationRoutes);

// ✅ Add health check for deployment testing
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "careerforge-ai-api",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));