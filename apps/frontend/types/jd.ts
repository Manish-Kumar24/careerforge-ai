// apps/frontend/types/jd.ts

export interface JDAnalysis {
  keyword_match: { score: number; found: string[]; missing: string[] };
  skills_alignment: { score: number; matches: string[]; gaps: string[] };
  experience_fit: { score: number; feedback: string };
  education_match: { score: number; feedback: string };
}

export interface JDMatch {
  _id: string;
  userId: string;
  resumeId: {
    _id: string;
    originalFilename: string;
    aiScore: number;
  };
  jdSource: "text"; // ✅ Only "text" now
  jdText: string;
  jdTitle?: string;
  matchScore: number;
  analysis: JDAnalysis;
  tailored_talking_points: string[];
  suggested_improvements: string[];
  createdAt: string;
}

export interface JDInput {
  text: string;
  title?: string;
}

export interface MatchRequest {
  resumeId: string;
  jdText: string; // ✅ Required, no optional jdUrl
  jdTitle?: string;
}