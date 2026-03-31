// filepath: apps/backend/src/models/Interview.ts

import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  company: String,
  role: String,
  status: {
    type: String,
    enum: ["applied", "interview", "offer", "rejected", "oa"],
    default: "applied"
  },
  notes: String
}, { timestamps: true });

export default mongoose.model("Interview", interviewSchema);