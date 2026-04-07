// apps\backend\src\controllers\practice.controller.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import PracticeProblem from "../models/PracticeProblem";
import PracticeProgress from "../models/PracticeProgress";

// GET ALL PROBLEMS (with filters)
export const getProblems = async (req: Request, res: Response) => {
  try {
    const { pattern, topic, company, difficulty, status, search, bookmarked } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const problemQuery: any = {};

    // Filter on PracticeProblem fields
    if (pattern && pattern !== "") {
      problemQuery.patterns = { $in: [new RegExp(pattern as string, "i")] };
    }
    if (topic && topic !== "") {
      problemQuery.topics = { $in: [new RegExp(topic as string, "i")] };
    }
    if (company && company !== "") {
      problemQuery.companies = { $in: [new RegExp(company as string, "i")] };
    }
    if (difficulty && difficulty !== "") {
      problemQuery.difficulty = difficulty;
    }
    if (search && search !== "") {
      problemQuery.title = { $regex: new RegExp(search as string, "i") };
    }

    // ✅ FIX: Handle status filter FIRST (before bookmarked) to avoid conflicts
    if (status && status !== "") {
      if (status === "not-started") {
        // Get problems user has ANY progress for
        const progress = await PracticeProgress.find({ userId }).select("problemId").lean();
        const startedIds = progress.map((p: any) => p.problemId.toString());

        // Get all problems matching other filters
        const allMatching = await PracticeProblem.find(problemQuery).select("_id").lean();
        const allIds = allMatching.map((p: any) => p._id.toString());

        // Filter to only not-started
        const notStartedIds = allIds.filter((id) => !startedIds.includes(id));

        if (notStartedIds.length === 0) {
          return res.json([]);
        }
        problemQuery._id = { $in: notStartedIds };
      } else if (status === "in-progress" || status === "completed") {
        // Get problems with specific status
        const progress = await PracticeProgress.find({
          userId,
          status: status,
        }).select("problemId").lean();
        const problemIds = progress.map((p: any) => p.problemId.toString());

        if (problemIds.length === 0) {
          return res.json([]);
        }
        problemQuery._id = { $in: problemIds };
      }
    }

    // ✅ FIX: Handle bookmarked filter AFTER status (so they combine correctly)
    if (bookmarked === "true") {
      const bookmarkedProgress = await PracticeProgress.find({
        userId,
        isBookmarked: true
      }).select("problemId").lean();

      const bookmarkedIds = bookmarkedProgress.map((p: any) => p.problemId.toString());

      if (bookmarkedIds.length === 0) {
        return res.json([]);
      }

      // ✅ FIX: Intersect with existing problemQuery._id if it exists
      if (problemQuery._id && problemQuery._id.$in) {
        // Intersect arrays
        problemQuery._id.$in = problemQuery._id.$in.filter((id: string) =>
          bookmarkedIds.includes(id)
        );
      } else {
        problemQuery._id = { $in: bookmarkedIds };
      }
    }

    const problems = await PracticeProblem.find(problemQuery)
      .sort({ sortOrder: 1, title: 1 })
      .lean();

    // Get progress for these problems only (more efficient)
    const progressMap: Record<string, any> = {};
    const problemIds = problems.map(p => p._id);
    const progress = await PracticeProgress.find({
      userId,
      problemId: { $in: problemIds }
    }).lean();

    for (const p of progress) {
      progressMap[p.problemId.toString()] = p;
    }

    const problemsWithProgress = problems.map((problem) => ({
      ...problem,
      progress: progressMap[problem._id.toString()] || null,
    }));

    res.json(problemsWithProgress);
  } catch (err: any) {
    console.error("❌ ERROR fetching problems:", err.message, err.stack);
    res.status(500).json({
      error: "Failed to fetch problems",
      details: err.message
    });
  }
};

// GET PROBLEM BY ID
export const getProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const problem = await PracticeProblem.findById(id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    let progress = null;
    if ((req as any).user?.id) {
      progress = await PracticeProgress.findOne({
        userId: (req as any).user.id,
        problemId: id,
      });
    }

    res.json({ ...problem.toObject(), progress });
  } catch (err) {
    console.error("Error fetching problem:", err);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
};

// UPDATE PROGRESS
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, attempts, timeSpent } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const problem = await PracticeProblem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // ✅ FIX: Only include fields that are defined
    const updateData: any = {};
    if (status !== undefined && status !== "") updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (attempts !== undefined) updateData.attempts = attempts;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const progress = await PracticeProgress.findOneAndUpdate(
      { userId, problemId: id },
      updateData,
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (err: any) {
    console.error("Error updating progress:", err.message);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

// GET USER PROGRESS SUMMARY
export const getProgressSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const totalProblems = await PracticeProblem.countDocuments();

    const completedCount = await PracticeProgress.countDocuments({
      userId,
      status: "completed",
    });
    const inProgressCount = await PracticeProgress.countDocuments({
      userId,
      status: "in-progress",
    });
    const notStartedCount = Math.max(0, totalProblems - completedCount - inProgressCount);

    // ✅ FIX: Proper aggregation with correct $unwind order
    const patternStats = await PracticeProblem.aggregate([
      {
        $lookup: {
          from: "practiceprogresses",
          let: { problemId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$problemId", "$$problemId"] },
                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] }
                  ]
                },
              },
            },
          ],
          as: "progress",
        },
      },
      // ✅ FIX: Unwind progress FIRST (so we can access .status)
      { $unwind: { path: "$progress", preserveNullAndEmptyArrays: true } },
      // ✅ FIX: Then unwind patterns
      { $unwind: "$patterns" },
      {
        $group: {
          _id: "$patterns",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                { $eq: ["$progress.status", "completed"] },
                1, 0
              ]
            },
          },
          inProgress: {
            $sum: {
              $cond: [
                { $eq: ["$progress.status", "in-progress"] },
                1, 0
              ]
            },
          },
        },
      },
      {
        $project: {
          pattern: "$_id",
          total: 1,
          completed: 1,
          inProgress: 1,
          notStarted: { $subtract: ["$total", { $add: ["$completed", "$inProgress"] }] },
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      total: totalProblems,
      completed: completedCount,
      inProgress: inProgressCount,
      notStarted: notStartedCount,
      percentage: totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0,
      byPattern: patternStats,
    });
  } catch (err: any) {
    console.error("Error fetching progress summary:", err.message);
    res.status(500).json({ error: "Failed to fetch progress summary" });
  }
};

// GET ALL UNIQUE VALUES (for filters)
export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const patterns = await PracticeProblem.distinct("patterns");
    const topics = await PracticeProblem.distinct("topics");
    const companies = await PracticeProblem.distinct("companies");

    res.json({
      patterns: patterns.sort(),
      topics: topics.sort(),
      companies: companies.sort(),
    });
  } catch (err) {
    console.error("Error fetching filter options:", err);
    res.status(500).json({ error: "Failed to fetch filter options" });
  }
};

// ============================================
// TIMER FUNCTIONS
// ============================================

export const startTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetSeconds } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const problem = await PracticeProblem.findById(id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const seconds = targetSeconds ||
      (problem.difficulty === "easy" ? 900 :
        problem.difficulty === "hard" ? 2700 : 1800);

    const progress = await PracticeProgress.findOneAndUpdate(
      { userId, problemId: id },
      {
        $set: {
          "timer.targetSeconds": seconds,
          "timer.remainingSeconds": seconds,
          "timer.startedAt": new Date(),
          "timer.pausedAt": null,
          "timer.isRunning": true,
        }
      },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (err: any) {
    console.error("Error starting timer:", err.message);
    res.status(500).json({ error: "Failed to start timer" });
  }
};

export const toggleTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const progress = await PracticeProgress.findOne({ userId, problemId: id });
    if (!progress) return res.status(404).json({ error: "Progress not found" });

    const timer = progress.timer || {
      targetSeconds: 0,
      remainingSeconds: 0,
      startedAt: null,
      pausedAt: null,
      isRunning: false,
    };

    const update: any = {};

    if (timer.isRunning) {
      const now = new Date().getTime();
      const startedAt = timer.startedAt ? new Date(timer.startedAt).getTime() : now;
      const elapsedSinceLastStart = Math.floor((now - startedAt) / 1000);
      const currentRemaining = Math.max(0, (timer.remainingSeconds ?? timer.targetSeconds) - elapsedSinceLastStart);


      // / ✅ Accumulate timeSpent across sessions
      const previousTimeSpent = progress.timeSpent || 0;
      const newTimeSpent = previousTimeSpent + elapsedSinceLastStart;

      update["timer.remainingSeconds"] = currentRemaining;
      update["timer.pausedAt"] = new Date();
      update["timer.isRunning"] = false;
      update["timeSpent"] = newTimeSpent; // ✅ Save accumulated time to DB
      // Debug logging (remove in production if desired)
      console.log(`⏱️ Timer paused: +${elapsedSinceLastStart}s, total timeSpent: ${newTimeSpent}s`);
    } else {
      update["timer.startedAt"] = new Date();
      update["timer.pausedAt"] = null;
      update["timer.isRunning"] = true;
    }

    const updated = await PracticeProgress.findOneAndUpdate(
      { userId, problemId: id },
      { $set: update },
      { new: true }
    );

    res.json(updated);
  } catch (err: any) {
    console.error("Error toggling timer:", err.message);
    res.status(500).json({ error: "Failed to toggle timer" });
  }
};

export const resetTimer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // ✅ Preserve existing timeSpent when resetting timer
    const existingProgress = await PracticeProgress.findOne({ userId, problemId: id });
    const preservedTimeSpent = existingProgress?.timeSpent || 0;

    const progress = await PracticeProgress.findOneAndUpdate(
      { userId, problemId: id },
      {
        $set: {
          "timer.targetSeconds": 0,
          "timer.remainingSeconds": 0,
          "timer.startedAt": null,
          "timer.pausedAt": null,
          "timer.isRunning": false,
          "timeSpent": preservedTimeSpent, // ✅ Preserve accumulated time
        }
      },
      { new: true }
    );

    res.json(progress);
  } catch (err: any) {
    console.error("Error resetting timer:", err.message);
    res.status(500).json({ error: "Failed to reset timer" });
  }
};

export const getRemainingTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const progress = await PracticeProgress.findOne({ userId, problemId: id });

    if (!progress || !progress.timer) {
      return res.json({
        remainingSeconds: null,
        isRunning: false,
        targetSeconds: 0,
        isExpired: false,
      });
    }

    const {
      targetSeconds = 0,
      remainingSeconds: savedRemaining,
      startedAt,
      isRunning,
    } = progress.timer;

    if (!isRunning) {
      if (targetSeconds === 0 || !startedAt) {
        return res.json({
          remainingSeconds: null,
          isRunning: false,
          targetSeconds: 0,
          isExpired: false,
        });
      }
      return res.json({
        remainingSeconds: savedRemaining ?? null,
        isRunning: false,
        targetSeconds,
        isExpired: (savedRemaining ?? 0) <= 0,
      });
    }

    const now = new Date().getTime();
    const start = startedAt ? new Date(startedAt).getTime() : now;
    const elapsedSinceResume = Math.floor((now - start) / 1000);
    const currentRemaining = Math.max(0, (savedRemaining ?? targetSeconds) - elapsedSinceResume);

    res.json({
      remainingSeconds: currentRemaining,
      isRunning: true,
      targetSeconds,
      isExpired: currentRemaining <= 0,
    });
  } catch (err: any) {
    console.error("Error getting remaining time:", err.message);
    res.status(500).json({ error: "Failed to get timer" });
  }
};

// ============================================
// ✅ BOOKMARK FUNCTION (NEW)
// ============================================

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const progress = await PracticeProgress.findOne({ userId, problemId: id });

    if (!progress) {
      // Create new progress entry with bookmark toggled on
      const newProgress = await PracticeProgress.create({
        userId,
        problemId: id,
        isBookmarked: true,
        status: "not-started",
      });
      return res.json(newProgress);
    }

    // Toggle existing bookmark
    const updated = await PracticeProgress.findOneAndUpdate(
      { userId, problemId: id },
      { $set: { isBookmarked: !progress.isBookmarked } },
      { new: true }
    );

    res.json(updated);
  } catch (err: any) {
    console.error("Error toggling bookmark:", err.message);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
};
