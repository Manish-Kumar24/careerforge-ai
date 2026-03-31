// filepath: apps/backend/src/models/User.ts

import mongoose, { Document } from "mongoose";

// 1. Define interface
export interface IUser extends Document {
  email: string;
  password: string;
}

// 2. Define schema
const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// 3. Export model
export default mongoose.model<IUser>("User", userSchema);