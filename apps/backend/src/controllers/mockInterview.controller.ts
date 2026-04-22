// filepath: apps/backend/src/controllers/mockInterview.controller.ts

import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { ParsedQs } from "qs";
import InterviewSession, { IInterviewSession, InterviewType, Difficulty, SessionStatus } from "../models/InterviewSession";
import InterviewLoop, { IInterviewLoop, LoopStatus } from "../models/InterviewLoop";
import { getTemplate, calculateRoundSchedule, CompanyTemplate } from "../config/interviewTemplates";
import { isRoundAvailable } from "../services/interview/loopScheduler";
import { validateSubmissionTime, calculateRemainingTime } from "../services/interview/sessionValidator";
import {
  generateFirstQuestion,
  generateNextQuestion,
  generateHint,
  generateReport,
  AIQuestionResponse,
  AIHintResponse,
  AIReportResponse
} from "../services/interview/aiOrchestrator";

// ========== TYPE HELPERS ==========
type SafeString = string;
type SafeQueryValue = SafeString | SafeString[] | undefined;

const parseRouteParam = (param: string | string[] | undefined, paramName: string): SafeString => {
  if (!param || Array.isArray(param)) {
    throw new Error(`Invalid ${paramName} parameter`);
  }
  return param;
};

const parseQueryFilter = (value: SafeQueryValue): SafeString | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value[0]; // Take first if array
  return value;
};

const parseQueryArray = (value: SafeQueryValue): SafeString[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
};

// ========== PRACTICE MODE ==========
export const startPracticeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }
    const { type, difficulty, durationMinutes, companyTag, resumeText, jdText } = req.body;

    if (!type || !difficulty || !durationMinutes) {
      res.status(400).json({ error: "type, difficulty, and durationMinutes are required" });
      return;
    }

    // Validate enum values
    const validTypes: InterviewType[] = ["DSA", "AI_ML", "SYSTEM_DESIGN", "BEHAVIORAL", "ROLE_SPECIFIC"];
    const validDifficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
    const validDurations: (30 | 45 | 60)[] = [30, 45, 60];

    if (!validTypes.includes(type)) {
      res.status(400).json({ error: "Invalid interview type" });
      return;
    }
    if (!validDifficulties.includes(difficulty)) {
      res.status(400).json({ error: "Invalid difficulty" });
      return;
    }
    if (!validDurations.includes(durationMinutes)) {
      res.status(400).json({ error: "Invalid duration" });
      return;
    }

    // Create session
    const session = await InterviewSession.create({
      userId,
      mode: "practice",
      type,
      difficulty,
      durationMinutes,
      companyTag,
      startTime: new Date(),
      conversation: [],
      status: "in_progress",
      personalization: {
        resumeText: resumeText?.slice(0, 5000),
        jdText: jdText?.slice(0, 5000)
      }
    });

    // Generate first question (stub)
    const { question } = await generateFirstQuestion(
      type,
      difficulty,
      companyTag,
      resumeText,
      jdText
    );

    // Log system message + first question
    session.conversation.push(
      { role: "system", content: `Interview started: ${type} • ${difficulty} • ${durationMinutes}min`, timestamp: new Date() },
      { role: "ai", content: question, timestamp: new Date() }
    );
    await session.save();

    res.status(201).json({
      sessionId: session._id,
      startTime: session.startTime,
      durationMinutes: session.durationMinutes,
      firstQuestion: question
    });
  } catch (error: any) {
    console.error("startPracticeSession error:", error);
    res.status(500).json({ error: error.message || "Failed to start practice session" });
  }
};

// ========== LOOP MODE ==========
export const createInterviewLoop = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id; // ✅ FIX
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }
    const { company, role, templateKey, resumeText, jdText } = req.body;

    const template = getTemplate(templateKey);
    if (!template) {
      res.status(400).json({ error: "Invalid template key" });
      return;
    }

    // Calculate round schedule
    const scheduledRounds = calculateRoundSchedule(template).map((sched, idx) => ({
      roundNumber: sched.roundNumber,
      type: template.rounds[idx].type,
      difficulty: template.rounds[idx].difficulty,
      durationMinutes: template.rounds[idx].durationMinutes,
      scheduledDate: sched.scheduledDate,
      status: "scheduled" as const
    }));

    // Create loop
    const loop = await InterviewLoop.create({
      userId,
      company,
      role,
      templateKey,
      rounds: scheduledRounds,
      status: "scheduled",
      personalization: {
        resumeText: resumeText?.slice(0, 5000),
        jdText: jdText?.slice(0, 5000)
      }
    });

    res.status(201).json({
      loopId: loop._id,
      company: loop.company,
      role: loop.role,
      schedule: loop.rounds.map(r => ({
        roundNumber: r.roundNumber,
        type: r.type,
        scheduledDate: r.scheduledDate,
        status: r.status
      }))
    });
  } catch (error: any) {
    console.error("createInterviewLoop error:", error);
    res.status(500).json({ error: error.message || "Failed to create interview loop" });
  }
};

export const startLoopRound = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ FIX: Consistent userId extraction
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }

    // ✅ FIX: Properly parse route params with validation
    const loopId = parseRouteParam(req.params.loopId, "loopId");
    const roundNumberStr = parseRouteParam(req.params.roundNumber, "roundNumber");
    const roundNumber = parseInt(roundNumberStr, 10);

    if (isNaN(roundNumber)) {
      res.status(400).json({ error: "Invalid round number" });
      return;
    }

    // Fetch loop + validate ownership
    const loop = await InterviewLoop.findOne({ _id: loopId, userId });
    if (!loop) {
      res.status(404).json({ error: "Interview loop not found" });
      return;
    }

    // Find round config
    const roundConfig = loop.rounds.find(r => r.roundNumber === roundNumber);
    if (!roundConfig) {
      res.status(404).json({ error: "Round not found in loop" });
      return;
    }

    // Check availability
    if (!isRoundAvailable(roundConfig.scheduledDate)) {
      res.status(403).json({
        error: `Round unlocks on ${roundConfig.scheduledDate.toISOString()}`
      });
    }

    // Create session for this round
const session = await InterviewSession.create({
  userId,
  mode: "loop",
  loopId: loop._id,
  roundNumber: roundConfig.roundNumber,
  type: roundConfig.type, // ✅ "DSA" from template
  difficulty: roundConfig.difficulty, // ✅ "MEDIUM" from template (NOT "EASY")
  durationMinutes: roundConfig.durationMinutes, // ✅ 45 from template (NOT 30)
  companyTag: loop.company, // ✅ "Meta"
  startTime: new Date(),
  conversation: [],
  status: "in_progress",
  personalization: loop.personalization
});

    // Update loop round reference
    const roundIdx = loop.rounds.findIndex(r => r.roundNumber === roundNumber);
    if (roundIdx !== -1) {
      loop.rounds[roundIdx].sessionId = session._id;
      loop.status = "in_progress";
      await loop.save();
    }

    // Generate first question
    const { question } = await generateFirstQuestion(
      roundConfig.type,
      roundConfig.difficulty,
      loop.company,
      loop.personalization?.resumeText,
      loop.personalization?.jdText
    );

    session.conversation.push(
      { role: "system", content: `Round ${roundConfig.roundNumber}: ${roundConfig.type} • ${loop.company}`, timestamp: new Date() },
      { role: "ai", content: question, timestamp: new Date() }
    );
    await session.save();

    res.status(201).json({
      sessionId: session._id,
      loopId: loop._id,
      roundNumber: roundConfig.roundNumber,
      startTime: session.startTime,
      durationMinutes: session.durationMinutes,
      firstQuestion: question
    });
  } catch (error: any) {
    console.error("startLoopRound error:", error);
    res.status(500).json({ error: error.message || "Failed to start round" });
  }
};
// ========== SHARED SESSION ENDPOINTS ==========
export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id; // ✅ FIX
    const sessionId = parseRouteParam(req.params.id, "sessionId");
    const { answer } = req.body;

    if (!answer) {
      res.status(400).json({ error: "answer is required" });
      return;
    }

    // Fetch session + validate ownership
    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (session.status !== "in_progress") {
      res.status(400).json({ error: "Session is not active" });
      return;
    }

    // Validate timer
    if (session.startTime && !validateSubmissionTime(session.startTime, session.durationMinutes)) {
      session.status = "expired";
      await session.save();
      res.status(400).json({ error: "Time expired" });
      return;
    }

    // Log user answer
    session.conversation.push({ role: "user", content: answer, timestamp: new Date() });

    // Generate next question (stub)
    const { question, isFollowUp } = await generateNextQuestion(
      session.conversation.map(c => ({ role: c.role, content: c.content })),
      answer,
    );

    session.conversation.push({ role: "ai", content: question, timestamp: new Date() });
    await session.save();

    const remainingSeconds = session.startTime
      ? calculateRemainingTime(session.startTime, session.durationMinutes)
      : null;

    res.json({
      nextQuestion: question,
      isFollowUp: isFollowUp || false,
      remainingSeconds
    });
  } catch (error: any) {
    console.error("submitAnswer error:", error);
    res.status(500).json({ error: error.message || "Failed to submit answer" });
  }
};

export const requestHint = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id; // ✅ FIX
    const sessionId = parseRouteParam(req.params.id, "sessionId");

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session || session.status !== "in_progress") {
      res.status(404).json({ error: "Active session not found" });
      return;
    }

    // Get last AI question for context
    const lastAI = [...session.conversation].reverse().find(m => m.role === "ai");
    if (!lastAI) {
      res.status(400).json({ error: "No question to hint on" });
      return;
    }

    // Generate hint (stub)
    const { hint } = await generateHint(lastAI.content, "User requested conceptual help");

    // Log hint
    session.conversation.push({ role: "hint", content: hint, timestamp: new Date() });
    await session.save();

    res.json({ hint });
  } catch (error: any) {
    console.error("requestHint error:", error);
    res.status(500).json({ error: error.message || "Failed to generate hint" });
  }
};

export const endSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id; // ✅ FIX
    const sessionId = parseRouteParam(req.params.id, "sessionId");
    const { reason } = req.body;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Mark as completed/expired
    const newStatus: SessionStatus = reason === "time_expired" ? "expired" : "completed";
    session.status = newStatus;
    session.endTime = new Date();

    // Generate report (stub)
    const report = await generateReport(
      session.conversation.map(c => ({ role: c.role, content: c.content })),
      { type: session.type, difficulty: session.difficulty, companyTag: session.companyTag }
    );

    session.report = report;
    await session.save();

    // If part of a loop, update loop progress
if (session.mode === "loop" && session.loopId && session.roundNumber) {
  const loop = await InterviewLoop.findById(session.loopId);

  if (loop) {
    const roundIdx = loop.rounds.findIndex(
      r => r.roundNumber === session.roundNumber
    );

    if (roundIdx !== -1) {
      loop.rounds[roundIdx].status = "completed";
    }

    // Check if all rounds completed
    const allDone = loop.rounds.every(
      r => r.status === "completed" || r.status === "skipped"
    );

    if (allDone) {
      loop.status = "completed";
    }

    await loop.save();
  }
}

    res.json({
      message: "Session ended",
      report: session.report,
      loopId: session.loopId,        
      roundNumber: session.roundNumber
    });
  } catch (error: any) {
    console.error("endSession error:", error);
    res.status(500).json({ error: error.message || "Failed to end session" });
  }
};

export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }
    
    const sessionId = parseRouteParam(req.params.id, "sessionId");
    
    const session = await InterviewSession.findOne({ _id: sessionId, userId })
      .select("-personalization"); // Exclude sensitive fields
    
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    
    // ✅ Ensure these fields are returned for frontend:
    const firstQuestion = session.conversation.find((m: any) => m.role === "ai")?.content || null;
    const remainingSeconds = session.startTime 
      ? require("../services/interview/sessionValidator").calculateRemainingTime(
          session.startTime, 
          session.durationMinutes
        )
      : null;
    
    res.json({
      _id: session._id,
      mode: session.mode,
      type: session.type,
      difficulty: session.difficulty,
      durationMinutes: session.durationMinutes,
      companyTag: session.companyTag,
      startTime: session.startTime,
      status: session.status,
      conversation: session.conversation, // ✅ Full conversation history
      firstQuestion, // ✅ First AI question for new sessions
      remainingSeconds // ✅ Server-calculated remaining time
    });
  } catch (error: any) {
    console.error("getSessionById error:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
};

// ========== DASHBOARD & HISTORY ==========
export const getInterviewHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const userIdObj = new Types.ObjectId(userId);

    // ✅ FIX: Properly parse query params
    const mode = parseQueryFilter(req.query.mode as SafeQueryValue);
    const type = parseQueryFilter(req.query.type as SafeQueryValue);
    const company = parseQueryFilter(req.query.company as SafeQueryValue);
    const status = parseQueryFilter(req.query.status as SafeQueryValue);

    const filter: any = { userIdObj }; 
    if (mode) filter.mode = mode;
    if (type) filter.type = type;
    if (company) filter.companyTag = company;
    if (status) filter.status = status;

    const sessions = await InterviewSession.find(filter)
      .select("-conversation -personalization") // Exclude heavy fields
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(sessions);
  } catch (error: any) {
    console.error("getInterviewHistory error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

export const getLoopHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ FIX: Consistent userId extraction
    const userId = req.user?.id || req.user?._id;
    const userIdObj = new Types.ObjectId(userId);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }

    // ✅ FIX: Properly parse query params
    const company = parseQueryFilter(req.query.company as SafeQueryValue);
    const status = parseQueryFilter(req.query.status as SafeQueryValue);

    const filter: any = { userIdObj }; // Use ObjectId for filtering
    if (company) filter.company = company;
    if (status) filter.status = status;

    const loops = await InterviewLoop.find(filter)
      .select("-personalization")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(loops);
  } catch (error: any) {
    console.error("getLoopHistory error:", error);
    res.status(500).json({ error: "Failed to fetch loops" });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }
    
    // ✅ FIX: Convert string userId to ObjectId for aggregation pipelines
    const userIdObj = new Types.ObjectId(userId);
    
    // Parse query filters
    const mode = parseQueryFilter(req.query.mode as SafeQueryValue);
    const type = parseQueryFilter(req.query.type as SafeQueryValue);
    const company = parseQueryFilter(req.query.company as SafeQueryValue);
    const timeRange = parseQueryFilter(req.query.timeRange as SafeQueryValue);

    // Build match stage - ✅ USE userIdObj (ObjectId) NOT userId (string)
    const matchStage: any = { userId: userIdObj, status: "completed" };
    if (mode) matchStage.mode = mode;
    if (type) matchStage.type = type;
    if (company) matchStage.companyTag = company;
    
    // Time range filter
    if (timeRange === "7d") {
      matchStage.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (timeRange === "30d") {
      matchStage.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    // 1. Basic stats aggregation - ✅ Now matches correctly
    const basicStats = await InterviewSession.aggregate([
      { $match: matchStage },
      { $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        avgScore: { $avg: "$report.overallScore" },
        avgTechnical: { $avg: "$report.categoryScores.technicalAccuracy" },
        avgProblemSolving: { $avg: "$report.categoryScores.problemSolving" },
        avgCommunication: { $avg: "$report.categoryScores.communication" },
        avgCodeStructure: { $avg: "$report.categoryScores.codeStructure" }
      }}
    ]);

    // 2. Trend data - ✅ Also use userIdObj
    const trendData = await InterviewSession.aggregate([
      { $match: matchStage },  // Reuses matchStage with ObjectId
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        avgScore: { $avg: "$report.overallScore" },
        sessionCount: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // 3. Category breakdown for radar chart
    const categoryAverages = basicStats[0] ? {
      technicalAccuracy: Math.round(basicStats[0].avgTechnical || 0),
      problemSolving: Math.round(basicStats[0].avgProblemSolving || 0),
      communication: Math.round(basicStats[0].avgCommunication || 0),
      codeStructure: Math.round(basicStats[0].avgCodeStructure || 0)
    } : { technicalAccuracy: 0, problemSolving: 0, communication: 0, codeStructure: 0 };

const recentSessions = await InterviewSession.find({ userId })
  .select("_id type difficulty companyTag report.overallScore createdAt")
  .sort({ createdAt: -1 })
  .limit(5)
  .lean();

// 4. Loop progress summary (with loopId and createdAt for frontend filtering)
const loopProgress = await InterviewLoop.aggregate([
  { $match: { userId: userIdObj } }, // Use ObjectId for consistency
  { $project: {
    company: 1,
    role: 1,
    createdAt: 1, // ✅ Include creation time for "recent loop" filtering
    rounds: 1
  }},
  { $addFields: {
    completedRounds: {
      $size: {
        $filter: {
          input: "$rounds",
          as: "round",
          cond: { $eq: ["$$round.status", "completed"] }
        }
      }
    },
    totalRounds: { $size: "$rounds" }
  }},
  { $project: {
    loopId: { $toString: "$_id" }, // ✅ Return loopId as string for frontend
    company: 1,
    role: 1,
    createdAt: 1,
    completed: "$completedRounds",
    total: "$totalRounds",
    completionRate: {
      $cond: [
        { $eq: ["$totalRounds", 0] },
        0,
        { $round: [{ $multiply: [{ $divide: ["$completedRounds", "$totalRounds"] }, 100] }] }
      ]
    }
  }},
  { $sort: { createdAt: -1 } },
  { $limit: 5 } // Only show 5 most recent loops
]);

res.json({
  totalSessions: basicStats[0]?.totalSessions || 0,
  avgScore: basicStats[0]?.avgScore ? Math.round(basicStats[0].avgScore) : null,
  categoryAverages,
  trend: trendData.map((d: any) => ({
    date: d._id,
    avgScore: Math.round(d.avgScore),
    sessionCount: d.sessionCount
  })),
  loopProgress, // ✅ Use the new loopProgress array directly
  recentSessions: recentSessions.map((s: any) => ({
    sessionId: s._id,
    type: s.type,
    difficulty: s.difficulty,
    companyTag: s.companyTag,
    score: s.report?.overallScore,
    date: s.createdAt
  }))
});
  } catch (error: any) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// ========== NEW: Fetch single loop by ID ==========
export const getLoopById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return;
    }

    const { id: loopId } = req.params;
    
    // Validate loopId format
    if (!loopId || typeof loopId !== "string" || loopId.length !== 24) {
      res.status(400).json({ error: "Invalid loop ID format" });
      return;
    }

    // Fetch loop with ownership check
    const loop = await InterviewLoop.findOne({ _id: loopId, userId }).lean();
    
    if (!loop) {
      res.status(404).json({ error: "Interview loop not found" });
      return;
    }

    res.json(loop);
  } catch (error: any) {
    console.error("getLoopById error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch loop" });
  }
};