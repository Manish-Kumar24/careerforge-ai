// apps/backend/src/services/resume/jdMatcher.ts

import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert technical recruiter and ATS specialist. 
Compare the candidate's resume with the job description. Return STRICT JSON matching this schema:
{
  "matchScore": number (0-100),
  "analysis": {
    "keyword_match": { "score": number, "found": string[], "missing": string[] },
    "skills_alignment": { "score": number, "matches": string[], "gaps": string[] },
    "experience_fit": { "score": number, "feedback": string },
    "education_match": { "score": number, "feedback": string }
  },
  "tailored_talking_points": string[] (max 5 items, each <200 chars),
  "suggested_improvements": string[] (max 5 items, each <200 chars)
}
CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no extra text.

RESUME TEXT:
{{resumeText}}

JOB DESCRIPTION:
{{jdText}}`;

export const matchResumeWithJD = async (resumeText: string, jdText: string) => {
  const truncatedResume = resumeText.slice(0, 15000);
  const truncatedJD = jdText.slice(0, 10000);
  
  const prompt = SYSTEM_PROMPT
    .replace("{{resumeText}}", truncatedResume)
    .replace("{{jdText}}", truncatedJD);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  try {
    const parsed = JSON.parse(content);
    if (
      typeof parsed.matchScore !== "number" || 
      !parsed.analysis?.keyword_match ||
      !Array.isArray(parsed.tailored_talking_points)
    ) {
      throw new Error("Invalid response structure");
    }
    return parsed;
  } catch (parseError) {
    console.error("JSON parse failed:", content);
    throw new Error("Failed to parse AI response");
  }
};