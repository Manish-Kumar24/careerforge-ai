// D:\Project\ai-interview-tracker\apps\backend\src\controllers\auth.controller.ts

import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashed });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Signup error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // ✅ IMPORTANT CHECK
    if (!user || !user.password) {
      return res.status(400).send("User not found");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).send("Invalid credentials");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
};