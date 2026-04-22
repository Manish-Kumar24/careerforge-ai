// filepath: apps/backend/src/routes/aiSummary.routes.ts

import express, { Request, Response } from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ✅ Define Report Type (minimal safe version)
interface Report {
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { report }: { report: Report } = req.body;

    if (!report) {
      return res.status(400).json({ error: "Report is required" });
    }

    const prompt = `
You are a senior FAANG-level interviewer.

Evaluate the candidate based on the report below.

DATA:
- Overall Score: ${report.overallScore}
- Strengths: ${report.strengths?.length ? report.strengths.join(", ") : "None"}
- Improvements: ${report.improvements?.length ? report.improvements.join(", ") : "None"}

Instructions:
- Give a sharp, specific evaluation (NOT generic)
- Mention 1-2 strengths explicitly
- Mention 1-2 critical improvements
- Add a final hiring signal (Strong Hire / Hire / Lean Hire / No Hire)
- Keep it within 4-5 lines
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a senior interviewer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const summary: string =
      completion.choices?.[0]?.message?.content ?? "";

    return res.json({ summary });
  } catch (err) {
    console.error("AI SUMMARY ERROR:", err);
    return res.status(500).json({
      error: "Failed to generate AI summary",
    });
  }
});

export default router;