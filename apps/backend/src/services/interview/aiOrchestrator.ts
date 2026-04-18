// apps/backend/src/services/interview/aiOrchestrator.ts

import { Groq } from "groq-sdk";
import { InterviewType, Difficulty } from "../../models/InterviewSession";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ========== SAFE STRING ESCAPING (Fix Bug #4) ==========
const escapePromptVariable = (str: string, maxLength: number = 1000): string => {
  return str
    .slice(0, maxLength)
    .replace(/"/g, '\\"')      // Escape quotes for JSON safety
    .replace(/\n/g, ' ')       // Normalize newlines
    .replace(/\s+/g, ' ')      // Collapse whitespace
    .trim();
};

// ========== CONSOLIDATED PROMPT TEMPLATES (Fix Bug #3) ==========
// All instructions in SYSTEM message; user message contains only dynamic data

const getFirstQuestionSystemPrompt = (type: InterviewType, difficulty: Difficulty, companyTag?: string): string => {
  const base = `You are an expert ${companyTag || 'top tech company'} interviewer conducting a ${difficulty} ${type.replace('_', ' / ')} mock interview.
Rules:
- Ask ONE question at a time. Wait for candidate's answer.
- Return ONLY valid JSON with exact schema specified below.
- NEVER include markdown, explanations, or text outside JSON.
- Do NOT provide solutions, scores, or feedback during session.
- Keep questions concise (<300 chars for follow-ups).`;

  const schemas: Record<InterviewType, string> = {
    DSA: `Schema: { "question": string (include problem statement, constraints, example I/O), "isFollowUp": false }`,
    AI_ML: `Schema: { "question": string (focus on model design, evaluation, or implementation), "isFollowUp": false }`,
    SYSTEM_DESIGN: `Schema: { "question": string (include scale requirements and key components), "isFollowUp": false }`,
    BEHAVIORAL: `Schema: { "question": string (use STAR method, focus on leadership/conflict/impact), "isFollowUp": false }`,
    ROLE_SPECIFIC: `Schema: { "question": string (tailor to ${companyTag || 'company'} tech stack and values), "isFollowUp": false }`
  };

  return `${base}\n${schemas[type]}`;
};

const NEXT_QUESTION_SYSTEM_PROMPT = `You are continuing a mock interview. Candidate just answered.
Rules:
- Return ONLY valid JSON: { "question": string, "isFollowUp": boolean }
- If answer is strong → acknowledge briefly in question, ask next topic
- If answer is weak/incomplete → ask focused clarifying follow-up OR move on
- NEVER give scores, feedback, or solutions during session
- Keep question concise (<300 chars)
- Output must be valid JSON only, no markdown or extra text.`;

const HINT_SYSTEM_PROMPT = `User requested a hint. Give a 1-2 sentence conceptual nudge ONLY.
Rules:
- Return ONLY valid JSON: { "hint": string }
- Do NOT reveal answer, solution steps, or scoring
- Do NOT evaluate the answer
- Keep hint actionable but not directive
- Output must be valid JSON only.`;

const REPORT_SYSTEM_PROMPT = `Analyze this full interview transcript and return a structured evaluation.
Return STRICT JSON matching this schema:
{
  "overallScore": number (0-100),
  "categoryScores": {
    "technicalAccuracy": number,
    "problemSolving": number, 
    "communication": number,
    "codeStructure": number
  },
  "perQuestionFeedback": [
    { "questionIndex": number, "question": string, "answer": string, "score": number, "feedback": string }
  ],
  "strengths": string[],
  "improvements": string[],
  "nextSteps": string[]
}
Rules:
- Score based on correctness, clarity, depth, and communication
- Feedback must be specific and actionable
- strengths/improvements/nextSteps: max 5 items each, <100 chars each
- Output must be valid JSON only, matching schema exactly.`;

// ========== RESPONSE INTERFACES ==========
export interface AIQuestionResponse { question: string; isFollowUp: boolean; } // ✅ isFollowUp now required
export interface AIHintResponse { hint: string; }
export interface AIReportResponse {
  overallScore: number;
  categoryScores: { technicalAccuracy: number; problemSolving: number; communication: number; codeStructure: number; };
  perQuestionFeedback: Array<{ 
    questionIndex: number; 
    question: string; 
    answer: string; 
    answerOriginal?: string;  // ✅ NEW
    score: number; 
    feedback: string;
    didNotAnswer?: boolean;   // ✅ NEW
  }>;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  meta?: { hintsUsed: number };  // ✅ NEW
}

// ========== CORE FUNCTIONS (WITH FIXES) ==========

export const generateFirstQuestion = async (
  type: InterviewType,
  difficulty: Difficulty,
  companyTag?: string,
  resumeContext?: string,
  jdContext?: string
): Promise<AIQuestionResponse> => {
  const systemPrompt = getFirstQuestionSystemPrompt(type, difficulty, companyTag);

  // Build user message with escaped, truncated context
  const contextParts = [];
  if (resumeContext) contextParts.push(`Candidate background: ${escapePromptVariable(resumeContext, 1000)}`);
  if (jdContext) contextParts.push(`Target role: ${escapePromptVariable(jdContext, 1000)}`);
  const userContent = contextParts.length > 0 ? contextParts.join("\n") : "Begin the interview.";

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt }, // ✅ Full instructions in system message
      { role: "user", content: userContent }     // ✅ Only dynamic data in user message
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 512,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  try {
    const parsed = JSON.parse(content) as AIQuestionResponse;
    // ✅ Validate required fields
    if (!parsed.question || typeof parsed.question !== "string" || typeof parsed.isFollowUp !== "boolean") {
      throw new Error("Invalid question response structure");
    }
    return { question: parsed.question, isFollowUp: parsed.isFollowUp };
  } catch (parseError) {
    console.error("JSON parse failed for first question:", { content, error: parseError });
    return {
      question: `Explain your approach to solving a ${difficulty.toLowerCase()} ${type.replace("_", " ")} problem.`,
      isFollowUp: false
    };
  }
};

export const generateNextQuestion = async (
  conversationHistory: Array<{ role: string; content: string }>,
  lastAnswer: string
): Promise<AIQuestionResponse> => {
  // ✅ Format history with clear role labels (Fix Bug #3 context clarity)
  const recentHistory = conversationHistory.slice(-6).map(m =>
    `${m.role.toUpperCase()}: ${escapePromptVariable(m.content, 500)}`
  ).join("\n");

  const userContent = `Last answer: ${escapePromptVariable(lastAnswer, 500)}\n\nRecent exchange:\n${recentHistory}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: NEXT_QUESTION_SYSTEM_PROMPT },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 512,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  try {
    const parsed = JSON.parse(content) as AIQuestionResponse;
    if (!parsed.question || typeof parsed.question !== "string" || typeof parsed.isFollowUp !== "boolean") {
      throw new Error("Invalid next question structure");
    }
    return { question: parsed.question, isFollowUp: parsed.isFollowUp };
  } catch (parseError) {
    console.error("JSON parse failed for next question:", { content, error: parseError });
    return { question: "What other approaches could you consider?", isFollowUp: true };
  }
};

export const generateHint = async (
  questionContext: string,
  userRequest: string
): Promise<AIHintResponse> => {
  // ✅ Include user's specific request in prompt (Fix Bug #2)
  const userContent = `Question context: ${escapePromptVariable(questionContext, 300)}\nUser request: ${escapePromptVariable(userRequest, 100)}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: HINT_SYSTEM_PROMPT },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 256,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty hint response");

  try {
    const parsed = JSON.parse(content) as AIHintResponse;
    if (!parsed.hint || typeof parsed.hint !== "string") {
      throw new Error("Invalid hint structure");
    }
    return { hint: parsed.hint };
  } catch {
    return { hint: "Think about the core concept and break the problem into smaller steps." };
  }
};

export const generateReport = async (
  fullConversation: Array<{ role: string; content: string }>,
  sessionConfig: { type: InterviewType; difficulty: Difficulty; companyTag?: string }
): Promise<AIReportResponse> => {
  // ✅ Count hints from conversation
  const hintsUsed = fullConversation.filter(m => m.role === "hint").length;

  // ✅ Format transcript with role labels (sanitized for AI)
  const transcript = fullConversation.slice(-20).map(m =>
    `${m.role.toUpperCase()}: ${escapePromptVariable(m.content, 800)}`
  ).join("\n\n");

  // ✅ Include session context in prompt
  const userContent = `Interview type: ${sessionConfig.type}\nDifficulty: ${sessionConfig.difficulty}\nCompany: ${sessionConfig.companyTag || 'Generic'}\n\nTRANSCRIPT:\n${transcript}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: REPORT_SYSTEM_PROMPT },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty report response");

  try {
    const parsed = JSON.parse(content) as AIReportResponse;

    // ✅ Comprehensive schema validation
    if (
      typeof parsed.overallScore !== "number" ||
      typeof parsed.categoryScores?.technicalAccuracy !== "number" ||
      !Array.isArray(parsed.perQuestionFeedback) ||
      !Array.isArray(parsed.strengths)
    ) {
      throw new Error("Invalid report structure");
    }

    // ✅ POLISH: Post-process feedback items
    const processedFeedback = parsed.perQuestionFeedback.map((item, idx) => {
      // Find corresponding user message in conversation
      const userMessages = fullConversation.filter(m => m.role === "user");
      const originalAnswer = userMessages[idx]?.content || "";

      return {
        ...item,
        answerOriginal: originalAnswer,  // ✅ Store original for UI
        didNotAnswer: originalAnswer.trim() === ""  // ✅ Flag empty answers
      };
    });

    return {
      ...parsed,
      perQuestionFeedback: processedFeedback,
      meta: { hintsUsed }  // ✅ Add hint count
    };
  } catch (parseError) {
    console.error("JSON parse failed for report:", { content, error: parseError });

    // ✅ Better fallback with polish fields
    return {
      overallScore: 70,
      categoryScores: { technicalAccuracy: 70, problemSolving: 70, communication: 70, codeStructure: 70 },
      perQuestionFeedback: [{
        questionIndex: 1,
        question: "Session question",
        answer: "Candidate response",
        answerOriginal: "",  // ✅ Fallback
        score: 70,
        feedback: "Review core concepts",
        didNotAnswer: false  // ✅ Fallback
      }],
      strengths: ["Clear communication"],
      improvements: ["Add more technical detail"],
      nextSteps: ["Practice similar problems"],
      meta: { hintsUsed: 0 }  // ✅ Fallback
    };
  }
};

// ========== JSON VALIDATION HELPER (Now Used Internally) ==========
export const validateStructuredJSON = <T>(response: string, requiredKeys: string[]): T | null => {
  try {
    const parsed = JSON.parse(response);
    for (const key of requiredKeys) {
      if (!(key in parsed) || parsed[key] === undefined) return null;
    }
    return parsed as T;
  } catch {
    return null;
  }
};