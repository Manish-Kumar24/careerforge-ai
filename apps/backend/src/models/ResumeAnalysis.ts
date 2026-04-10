import mongoose, { Document } from "mongoose";

export interface IResumeAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  originalFilename: string;
  fileSize: number;
  extractedText: string; // Stored after parsing, file deleted
  aiScore: number;
  feedback: {
    ats_compatibility: { score: number; feedback: string };
    skills_match: { score: number; missing: string[]; suggestions: string[] };
    formatting: { score: number; issues: string[] };
    keywords: { found: string[]; missing: string[] };
  };
  overall_summary: string;
  actionable_steps: string[];
  createdAt: Date;
}

const resumeAnalysisSchema = new mongoose.Schema<IResumeAnalysis>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  originalFilename: { type: String, required: true },
  fileSize: { type: Number, required: true },
  extractedText: { type: String, required: true, maxlength: 50000 }, // Limit to avoid bloating DB
  aiScore: { type: Number, required: true, min: 0, max: 100 },
  feedback: {
    ats_compatibility: {
      score: { type: Number, required: true },
      feedback: { type: String, required: true }
    },
    skills_match: {
      score: { type: Number, required: true },
      missing: [{ type: String }],
      suggestions: [{ type: String }]
    },
    formatting: {
      score: { type: Number, required: true },
      issues: [{ type: String }]
    },
    keywords: {
      found: [{ type: String }],
      missing: [{ type: String }]
    }
  },
  overall_summary: { type: String, required: true },
  actionable_steps: [{ type: String }]
}, { timestamps: true });

// Compound index for user history queries
resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IResumeAnalysis>("ResumeAnalysis", resumeAnalysisSchema);