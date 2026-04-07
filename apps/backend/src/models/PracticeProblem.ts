// apps\backend\src\models\PracticeProblem.ts

import mongoose, { Document } from "mongoose"; // ✅ ADD Document import

// ✅ Interface extending Mongoose Document
export interface IPracticeProblem extends Document {
  title: string;
  link: string;
  platform: "leetcode" | "geeksforgeeks";
  patterns: string[];
  topics: string[];
  companies: string[];
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  isVerified: boolean;
  lastVerifiedAt: Date;
  sortOrder: number;
  targetTimeMinutes?: number;
}

const practiceProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["leetcode", "geeksforgeeks"],
      default: "leetcode",
    },
    patterns: {
      type: [String],
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    companies: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    targetTimeMinutes: {
      type: Number,
    },

  },
  { timestamps: true }
);

// Index for faster queries
practiceProblemSchema.index({ patterns: 1 });
practiceProblemSchema.index({ companies: 1 });
practiceProblemSchema.index({ difficulty: 1 });

// ✅ Add this pre-save hook AFTER the schema definition, BEFORE the model export:
practiceProblemSchema.pre("save", function (next) {
  // Only set default if targetTimeMinutes is not already set
  if (this.isNew && this.targetTimeMinutes === undefined) {
    if (this.difficulty === "easy") {
      this.targetTimeMinutes = 15;
    } else if (this.difficulty === "hard") {
      this.targetTimeMinutes = 45;
    } else {
      this.targetTimeMinutes = 30;
    }
  }
  next();
});

// ✅ SINGLE default export (typed)
export default mongoose.model<IPracticeProblem>("PracticeProblem", practiceProblemSchema);