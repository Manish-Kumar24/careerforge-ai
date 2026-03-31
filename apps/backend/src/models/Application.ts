// filepath: apps/backend/src/models/Application.ts

import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },

        company: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["applied", "interview", "offer", "rejected", "oa"],
            default: "applied",
        },

        appliedDate: {
            type: Date,
            default: Date.now,
        },

        notes: {
            type: String,
            default: "",
        },

        isPriority: {
            type: Boolean,
            default: false,
        },

        // ✅ NEW: Timeline for tracking all activities
        timeline: [{
            note: { type: String, required: true },
            type: { 
                type: String, 
                enum: ["manual", "status_change", "priority_toggle", "created"], 
                default: "manual" 
            },
            createdAt: { type: Date, default: Date.now },
        }],
    },
    { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);