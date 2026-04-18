// filepath: apps/backend/src/server.ts

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import { connectDB } from "./config/db";

import authRoutes from "./routes/auth.routes";
import aiRoutes from "./routes/ai.routes";
import interviewRoutes from "./routes/interview.routes";
import applicationRoutes from "./routes/application.routes";
import resumeRoutes from "./routes/resume.routes";
import practiceRoutes from "./routes/practice.routes";
import jdRoutes from "./routes/jd.routes"; // ✅ ADD THIS
import mockInterviewRoutes from "./routes/mockInterview.routes";
connectDB();

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      const allowed = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://careerforge-ai-frontend-omega.vercel.app",
        "https://careerforge-ai-frontend-git-main-manish-kumar24s-projects.vercel.app",  // ✅ Add your Vercel preview URL
        /\.vercel\.app$/,  // ✅ Allow any Vercel subdomain (regex)
      ];
      
      if (allowed.some(pattern => 
        typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
      )) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // ✅ FIX: Allow all headers that frontend might send
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "Cache-Control",  // ✅ Added: frontend sends this
      "Pragma",         // ✅ Added: frontend sends this
      "Expires",        // ✅ Added: frontend sends this
    ],
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
app.use("/api/resume", resumeRoutes); // ✅ ADD THIS LINE
app.use("/api/jd", jdRoutes); // ✅ ADD THIS LINE
app.use("/api/mock-interview", mockInterviewRoutes); // ✅ ADD THIS LINE

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