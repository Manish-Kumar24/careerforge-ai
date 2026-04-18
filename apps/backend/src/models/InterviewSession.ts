//apps/backend/src/models/InterviewSession.ts

import mongoose, { Document, Schema } from "mongoose";

export type InterviewMode = "practice" | "loop";
export type InterviewType = "DSA" | "AI_ML" | "SYSTEM_DESIGN" | "BEHAVIORAL" | "ROLE_SPECIFIC";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type SessionStatus = "in_progress" | "completed" | "expired" | "cancelled";

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  mode: InterviewMode;
  type: InterviewType;
  difficulty: Difficulty;
  durationMinutes: 30 | 45 | 60;
  companyTag?: string;
  loopId?: mongoose.Types.ObjectId; // Nullable: only set if part of a loop
  roundNumber?: number; // Nullable: only set if part of a loop
  startTime?: Date;
  endTime?: Date;
  conversation: Array<{
    role: "ai" | "user" | "hint" | "system";
    content: string;
    timestamp: Date;
  }>;
  status: SessionStatus;
  report?: {
    overallScore: number;
    categoryScores: {
      technicalAccuracy: number;
      problemSolving: number;
      communication: number;
      codeStructure: number;
    };
    perQuestionFeedback: Array<{
      questionIndex: number;
      question: string;
      answer: string;
      answerOriginal?: string;
      score: number;
      feedback: string;
      didNotAnswer?: boolean;
    }>;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
    meta?: {                    // ✅ NEW: Optional metadata
      hintsUsed: number;
    };
  };
  personalization?: {
    resumeText?: string; // Injected into prompt only, truncated
    jdText?: string; // Injected into prompt only, truncated
  };
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<IInterviewSession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  mode: { type: String, enum: ["practice", "loop"], required: true },
  type: { type: String, enum: ["DSA", "AI_ML", "SYSTEM_DESIGN", "BEHAVIORAL", "ROLE_SPECIFIC"], required: true },
  difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: true },
  durationMinutes: { type: Number, enum: [30, 45, 60], required: true },
  companyTag: { type: String },
  loopId: { type: Schema.Types.ObjectId, ref: "InterviewLoop", index: true },
  roundNumber: { type: Number },
  startTime: { type: Date },
  endTime: { type: Date },
  conversation: [{
    role: { type: String, enum: ["ai", "user", "hint", "system"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ["in_progress", "completed", "expired", "cancelled"], default: "in_progress" },
  report: {
    overallScore: Number,
    categoryScores: {
      technicalAccuracy: Number,
      problemSolving: Number,
      communication: Number,
      codeStructure: Number
    },
    perQuestionFeedback: [{
      questionIndex: Number,
      question: String,
      answer: String,
      answerOriginal: { type: String, default: null },  // ✅ NEW
      score: Number,
      feedback: String,
      didNotAnswer: { type: Boolean, default: false }    // ✅ NEW
    }],
    strengths: [String],
    improvements: [String],
    nextSteps: [String],
    meta: {                                                // ✅ NEW
      hintsUsed: { type: Number, default: 0 }
    }
  },
  personalization: {
    resumeText: { type: String, maxlength: 5000 },
    jdText: { type: String, maxlength: 5000 }
  }
}, { timestamps: true });

// Indexes for fast queries
sessionSchema.index({ userId: 1, mode: 1, status: 1, createdAt: -1 });
sessionSchema.index({ loopId: 1, roundNumber: 1 });

export default mongoose.model<IInterviewSession>("InterviewSession", sessionSchema);