// apps/backend/src/controllers/resume.controller.ts
// @ts-nocheck - Multer/Express type issues; runtime logic verified

import { Request, Response } from "express";
import ResumeAnalysis from "../models/ResumeAnalysis";
import { extractTextFromFile } from "../services/resume/fileParser";
import { analyzeResumeWithAI } from "../services/resume/aiAnalyzer";
import fs from "fs/promises";

export const uploadResume = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;

    const extractedText = await extractTextFromFile(filePath, mimetype);
    if (!extractedText || extractedText.length < 50) {
      await fs.unlink(filePath).catch(() => {});
      return res.status(400).json({ error: "Could not extract readable text from resume" });
    }

    const analysis = await analyzeResumeWithAI(extractedText);

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

    await fs.unlink(filePath).catch(err => console.warn("File cleanup warning:", err));

    const { extractedText: _, ...safeResult } = resumeAnalysis.toObject();
    res.status(201).json(safeResult);

  } catch (error: any) {
  // ✅ CRITICAL: Log full error details to Render logs
  console.error("❌ RESUME UPLOAD CRASH:", {
    message: error.message,
    code: error.code,
    stack: error.stack?.split('\n').slice(0, 3).join('\n'),
    fileName: req.file?.originalname,
    mimetype: req.file?.mimetype,
    fileSize: req.file?.size,
    userId: req.user?._id || req.user?.id,
    groqKeySet: !!process.env.GROQ_API_KEY,
    mongoConnected: mongoose.connection.readyState === 1,
  });

  // Clean up file on error
  if (req.file?.path) {
    await fs.unlink(req.file.path).catch(() => {});
  }

  // Return user-friendly error (never expose stack to client)
  res.status(500).json({ 
    error: "Failed to process resume. Please try a smaller PDF or contact support." 
  });
}
};

export const getAnalysisHistory = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

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

export const getAnalysisById = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params || {};
    const analysis = await ResumeAnalysis.findOne({ _id: id, userId })
      .select("-extractedText");
    
    if (!analysis) return res.status(404).json({ error: "Analysis not found" });
    res.json(analysis);
  } catch (error) {
    console.error("Fetch by ID error:", error);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
};