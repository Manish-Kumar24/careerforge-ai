// apps/backend/src/models/JDMatch.ts

import mongoose, { Document } from "mongoose";

export interface IJDMatch extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jdSource: "text"; // ✅ Only "text" now
  jdText: string;
  jdTitle?: string;
  matchScore: number;
  analysis: {
    keyword_match: { score: number; found: string[]; missing: string[] };
    skills_alignment: { score: number; matches: string[]; gaps: string[] };
    experience_fit: { score: number; feedback: string };
    education_match: { score: number; feedback: string };
  };
  tailored_talking_points: string[];
  suggested_improvements: string[];
  createdAt: Date;
}

const jdMatchSchema = new mongoose.Schema<IJDMatch>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "ResumeAnalysis", required: true },
  jdSource: { type: String, enum: ["text"], required: true }, // ✅ Only "text"
  jdText: { type: String, required: true, maxlength: 10000 },
  jdTitle: { type: String },
  matchScore: { type: Number, required: true, min: 0, max: 100 },
  analysis: {
    keyword_match: {
      score: { type: Number, required: true },
      found: [{ type: String }],
      missing: [{ type: String }]
    },
    skills_alignment: {
      score: { type: Number, required: true },
      matches: [{ type: String }],
      gaps: [{ type: String }]
    },
    experience_fit: {
      score: { type: Number, required: true },
      feedback: { type: String, required: true }
    },
    education_match: {
      score: { type: Number, required: true },
      feedback: { type: String, required: true }
    }
  },
  tailored_talking_points: [{ type: String, maxlength: 200 }],
  suggested_improvements: [{ type: String, maxlength: 200 }]
}, { timestamps: true });

jdMatchSchema.index({ resumeId: 1, createdAt: -1 });

export default mongoose.model<IJDMatch>("JDMatch", jdMatchSchema);