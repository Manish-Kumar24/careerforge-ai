import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert ATS resume analyzer. Analyze the resume text and return STRICT JSON matching this schema:
{
  "score": number (0-100),
  "feedback": {
    "ats_compatibility": { "score": number, "feedback": string },
    "skills_match": { "score": number, "missing": string[], "suggestions": string[] },
    "formatting": { "score": number, "issues": string[] },
    "keywords": { "found": string[], "missing": string[] }
  },
  "overall_summary": string,
  "actionable_steps": string[] (max 5 items)
}
DO NOT include markdown, explanations, or extra text. Return ONLY valid JSON.`;

// ✅ FIX: Lazy initialization - create client inside function, not at module scope
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is required");
  }
  return new Groq({ apiKey });
};

export const analyzeResumeWithAI = async (extractedText: string) => {
    const groq = getGroqClient();
  // Truncate to avoid token limits (llama-3.3-70b has 128k context, but be safe)
  const truncatedText = extractedText.slice(0, 25000);
  
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Resume text to analyze:\n\n${truncatedText}` }
    ],
    response_format: { type: "json_object" }, // ✅ Critical for structured output
    temperature: 0.1, // Low temperature for consistent JSON
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  try {
    const parsed = JSON.parse(content);
    // Basic validation of required fields
    if (typeof parsed.score !== "number" || !parsed.feedback) {
      throw new Error("Invalid response structure");
    }
    return parsed;
  } catch (parseError) {
    console.error("JSON parse failed:", content);
    throw new Error("Failed to parse AI response");
  }
};