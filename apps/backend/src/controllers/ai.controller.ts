// filepath: apps/backend/src/controllers/ai.controller.ts

import { Request, Response } from "express";
import { askGroq } from "../services/ai.service";

export const askAI = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const answer = await askGroq(prompt);

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
};