// apps/backend/src/models/InterviewLoop.ts

import mongoose, { Document, Schema } from "mongoose";
import { InterviewType, Difficulty } from "./InterviewSession";

export type LoopStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface IInterviewLoop extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  templateKey: string; // e.g., "meta_sde_2025"
  rounds: Array<{
    roundNumber: number;
    type: InterviewType;
    difficulty: Difficulty;
    durationMinutes: 30 | 45 | 60;
    scheduledDate: Date;
    sessionId?: mongoose.Types.ObjectId; // Linked InterviewSession
    status: "scheduled" | "completed" | "skipped";
  }>;
  status: LoopStatus;
  personalization?: {
    resumeText?: string;
    jdText?: string;
  };
  loopReport?: {
    overallScore: number;
    roundScores: Array<{ roundNumber: number; score: number }>;
    consolidatedFeedback: string;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const loopSchema = new Schema<IInterviewLoop>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  templateKey: { type: String, required: true },
  rounds: [{
    roundNumber: { type: Number, required: true },
    type: { type: String, enum: ["DSA", "AI_ML", "SYSTEM_DESIGN", "BEHAVIORAL", "ROLE_SPECIFIC"], required: true },
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], required: true },
    durationMinutes: { type: Number, enum: [30, 45, 60], required: true },
    scheduledDate: { type: Date, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "InterviewSession" },
    status: { type: String, enum: ["scheduled", "completed", "skipped"], default: "scheduled" }
  }],
  status: { type: String, enum: ["scheduled", "in_progress", "completed", "cancelled"], default: "scheduled" },
  personalization: {
    resumeText: { type: String, maxlength: 5000 },
    jdText: { type: String, maxlength: 5000 }
  },
  loopReport: {
    overallScore: Number,
    roundScores: [{ roundNumber: Number, score: Number }],
    consolidatedFeedback: String,
    strengths: [String],
    improvements: [String],
    nextSteps: [String]
  }
}, { timestamps: true });

// Indexes
loopSchema.index({ userId: 1, status: 1, createdAt: -1 });
loopSchema.index({ company: 1, role: 1 });

export default mongoose.model<IInterviewLoop>("InterviewLoop", loopSchema);