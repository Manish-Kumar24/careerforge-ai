// D:\Project\ai-interview-tracker\apps\backend\src\controllers\auth.controller.ts

import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, email: user.email }
    });
    
  } catch (error: any) {
    // 🔥 Handle duplicate email specifically
    if (error.code === 11000 && error.keyPattern?.email) {
      console.log(`⚠️ Duplicate signup attempt for: ${error.keyValue.email}`);
      return res.status(409).json({ 
        message: "Email already registered",
        error: "This email is already in use. Please login or use a different email."
      });
    }

    // Log other errors for debugging
    console.error("❌ SIGNUP ERROR:", {
      message: error.message,
      name: error.name,
      code: error.code,
      env: {
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
        JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length,
        MONGO_URI_SET: !!process.env.MONGO_URI,
      }
    });

    res.status(500).json({ 
      message: "Signup failed", 
      error: error.message || "Unknown error" 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Validate JWT_SECRET before signing
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not set in environment!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }  // ✅ Add expiry for security
    );

    res.json({ token });
    
  } catch (error: any) {
    console.error("❌ LOGIN ERROR:", {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });

    res.status(500).json({ 
      message: "Login failed", 
      error: error.message || "Unknown error" 
    });
  }
};