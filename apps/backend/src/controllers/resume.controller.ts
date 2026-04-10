// apps/backend/src/controllers/resume.controller.ts

import { Request, Response } from "express";
import ResumeAnalysis from "../models/ResumeAnalysis";
import { extractTextFromFile } from "../services/resume/fileParser";
import { analyzeResumeWithAI } from "../services/resume/aiAnalyzer";
import fs from "fs/promises";
import path from "path";

// ✅ Simple type for requests with multer file + auth user
type AuthRequest = Request & {
  user?: { _id?: string; id?: string; userId?: string };
  file?: Express.Multer.File;
  params?: { id?: string };
};

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    // ✅ Flexible userId extraction (handles all JWT payload formats)
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      console.error("❌ Could not extract userId from token. req.user:", req.user);
      return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;

    // 1. Extract text
    const extractedText = await extractTextFromFile(filePath, mimetype);
    if (!extractedText || extractedText.length < 50) {
      await fs.unlink(filePath).catch(() => { });
      return res.status(400).json({ error: "Could not extract readable text from resume" });
    }

    // 2. Analyze with AI
    const analysis = await analyzeResumeWithAI(extractedText);

    // 3. Save to MongoDB
    const resumeAnalysis = await ResumeAnalysis.create({
      userId,
      originalFilename: originalname,
      fileSize: size,
      extractedText,
      aiScore: analysis.score,
      feedback: analysis.feedback,
      overall_summary: analysis.overall_summary,
      actionable_steps: analysis.actionable_steps,
    });

    // 4. Clean up temp file
    await fs.unlink(filePath).catch(err => console.warn("File cleanup warning:", err));

    // 5. Return result (exclude raw text)
    const { extractedText: _, ...safeResult } = resumeAnalysis.toObject();
    res.status(201).json(safeResult);

  } catch (error: any) {
    console.error("Resume upload error:", error);

    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => { });
    }

    res.status(500).json({
      error: error.message || "Failed to process resume"
    });
  }
};

export const getAnalysisHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    const analyses = await ResumeAnalysis.find({ userId })
      .select("-extractedText")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(analyses);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

export const getAnalysisById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    const { id } = req.params || {};

    const analysis = await ResumeAnalysis.findOne({ _id: id, userId })
      .select("-extractedText");

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    console.error("Fetch by ID error:", error);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
};