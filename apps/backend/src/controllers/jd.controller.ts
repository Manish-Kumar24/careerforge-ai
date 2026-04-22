// apps/backend/src/controllers/jd.controller.ts

import { Request, Response } from "express";
import JDMatch from "../models/JDMatch";
import ResumeAnalysis from "../models/ResumeAnalysis";
import { cleanJDText } from "../services/resume/jdParser";
import { matchResumeWithJD } from "../services/resume/jdMatcher";

export const matchWithJD = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ FIX: Flexible userId extraction (same as resume.controller.ts)
    const userId = (req.user as any)?._id || (req.user as any)?.id || (req.user as any)?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }

    const { resumeId, jdText, jdTitle } = req.body;
    
    // ✅ Text-only validation
    if (!resumeId) {
      res.status(400).json({ error: "resumeId is required" });
      return;
    }
    if (!jdText) {
      res.status(400).json({ error: "jdText is required" });
      return;
    }

    // 1. Fetch resume (ensure ownership)
    const resume = await ResumeAnalysis.findOne({ _id: resumeId, userId });
    if (!resume) {
      res.status(404).json({ error: "Resume analysis not found" });
      return;
    }

    // 2. Clean JD text (text-only)
    const cleanedJD = cleanJDText(jdText);
    if (!cleanedJD || cleanedJD.length < 50) {
      res.status(400).json({ error: "Job description is too short or invalid" });
      return;
    }

    // 3. Run AI matching
    const analysis = await matchResumeWithJD(resume.extractedText, cleanedJD);

    // 4. Save result (text-only)
    const jdMatch = await JDMatch.create({
      userId,
      resumeId,
      jdSource: "text", // ✅ Always "text"
      jdText: cleanedJD,
      jdTitle: jdTitle?.slice(0, 200),
      matchScore: analysis.matchScore,
      analysis: analysis.analysis,
      tailored_talking_points: analysis.tailored_talking_points,
      suggested_improvements: analysis.suggested_improvements,
    });

    res.status(201).json(jdMatch);

  } catch (error: any) {
    console.error("JD match error:", {
      message: error.message,
      stack: error.stack?.split('\n')[0],
      userId: (req.user as any)?.id || (req.user as any)?._id,
    });
    
    res.status(500).json({ error: error.message || "Failed to match resume with JD" });
  }
};

export const getMatchHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?._id || (req.user as any)?.id || (req.user as any)?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { resumeId } = req.query;
    const query: any = { userId };
    if (resumeId) query.resumeId = resumeId;

    const matches = await JDMatch.find(query)
      .populate("resumeId", "originalFilename aiScore")
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(matches);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch match history" });
  }
};

export const getMatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?._id || (req.user as any)?.id || (req.user as any)?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    
    const match = await JDMatch.findOne({ _id: id, userId })
      .populate("resumeId", "originalFilename aiScore");
    
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    
    res.json(match);
  } catch (error) {
    console.error("Fetch by ID error:", error);
    res.status(500).json({ error: "Failed to fetch match" });
  }
};