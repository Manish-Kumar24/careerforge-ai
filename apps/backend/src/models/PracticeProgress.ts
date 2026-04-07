// apps\backend\src\models\PracticeProgress.ts

import mongoose from "mongoose";

const practiceProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PracticeProblem",
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    // ✅ NEW: Bookmark for revision
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    // Timer fields
    timer: {
      targetSeconds: { type: Number, default: 0 },
      remainingSeconds: { type: Number, default: 0 },
      startedAt: { type: Date },
      pausedAt: { type: Date },
      isRunning: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Ensure one progress entry per user per problem
practiceProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

// Index for bookmark queries
practiceProgressSchema.index({ userId: 1, isBookmarked: 1 });

// Index for timer queries
practiceProgressSchema.index({ userId: 1, "timer.isRunning": 1 });

export default mongoose.model("PracticeProgress", practiceProgressSchema);