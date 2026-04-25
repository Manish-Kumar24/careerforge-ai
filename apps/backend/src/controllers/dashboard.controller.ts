// filepath: apps/backend/src/controllers/dashboard.controller.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import PracticeProgress from "../models/PracticeProgress";
import Application from "../models/Application";
import PracticeProblem from "../models/PracticeProblem";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: Invalid token payload" });
            return;
        }
        const [
            applicationsCount,
            applicationBreakdown,
            dsaProgress,
            totalProblems
        ] = await Promise.all([
            // 1. Total applications count
            Application.countDocuments({ userId }),

            // 2. Application status breakdown (for the Applications card)
            Application.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 3. DSA progress breakdown (for the DSA card progress bar)
            PracticeProgress.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),

            // 4. Total available DSA problems
            PracticeProblem.countDocuments({}) // ← Update filter if not all problems are DSA
        ]);

        // ✅ Process application breakdown into a clean object
        const appStatusMap: Record<string, number> = {};
        applicationBreakdown.forEach((item: { _id: string; count: number }) => {
            appStatusMap[item._id] = item.count;
        });

        // Calculate application success rate: (offers / total) * 100
        const offers = appStatusMap["offer"] || 0;
        const applicationSuccessRate = applicationsCount > 0
            ? Math.round((offers / applicationsCount) * 100)
            : 0;

        // ✅ Process DSA progress breakdown
        const dsaStatusMap: Record<string, number> = {};
        dsaProgress.forEach((item: { _id: string; count: number }) => {
            dsaStatusMap[item._id] = item.count;
        });

        const dsaCompleted = dsaStatusMap["completed"] || 0;
        const dsaInProgress = dsaStatusMap["in-progress"] || 0;
        const dsaNotStarted = totalProblems - dsaCompleted - dsaInProgress; // Remaining = total - attempted

        // Calculate DSA success rate: (completed / total) * 100
        const dsaSuccessRate = totalProblems > 0
            ? Math.round((dsaCompleted / totalProblems) * 100)
            : 0;

        res.json({
            // Applications card data
            applications: applicationsCount,
            applicationSuccessRate,
            applicationBreakdown: appStatusMap, // { offer: 2, rejected: 1, oa: 1, interview: 0, ... }

            // DSA card data
            dsaSolved: dsaCompleted,
            dsaTotal: totalProblems,
            dsaSuccessRate,
            dsaProgress: {
                completed: dsaCompleted,
                inProgress: dsaInProgress,
                notStarted: Math.max(0, dsaNotStarted) // Ensure non-negative
            },

            lastUpdated: new Date().toISOString()
        });
        return;

    } catch (error: any) {
        console.error("getDashboardStats error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
        return;
    }
};