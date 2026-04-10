// apps/frontend/types/resume.ts

export interface ResumeFeedback {
  ats_compatibility: { score: number; feedback: string };
  skills_match: { score: number; missing: string[]; suggestions: string[] };
  formatting: { score: number; issues: string[] };
  keywords: { found: string[]; missing: string[] };
}

export interface ResumeAnalysis {
  _id: string;
  userId: string;
  originalFilename: string;
  fileSize: number;
  aiScore: number;
  feedback: ResumeFeedback;
  overall_summary: string;
  actionable_steps: string[];
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
}

export type UploadStatus = "idle" | "uploading" | "analyzing" | "success" | "error";