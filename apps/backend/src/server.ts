// filepath: apps/backend/src/server.ts

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";

import authRoutes from "./routes/auth.routes";
import aiRoutes from "./routes/ai.routes";
import interviewRoutes from "./routes/interview.routes";
import applicationRoutes from "./routes/application.routes";

import practiceRoutes from "./routes/practice.routes";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      const allowed = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",  // ← Add this
        "https://careerforge-ai-frontend-omega.vercel.app",
      ];
      
      if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Length", "X-RateLimit-Limit"],
  })
);

// Explicitly handle ALL preflight requests
app.options("*", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/practice", practiceRoutes);

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