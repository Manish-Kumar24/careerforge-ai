// filepath : apps/backend/src/models/ChatSession.ts

import mongoose, { Document, Schema } from "mongoose";

// Message interface for the chat history
export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

// Main Session Interface
export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false }); // We don't need a separate ID for every single message

const chatSessionSchema = new Schema<IChatSession>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true // Index for fast lookups by user
    },
    title: { 
      type: String, 
      default: "New Chat",
      maxlength: 100
    },
    messages: { 
      type: [chatMessageSchema], 
      default: [] 
    }
  },
  { timestamps: true } // Automatically manages createdAt & updatedAt
);

export default mongoose.model<IChatSession>("ChatSession", chatSessionSchema);