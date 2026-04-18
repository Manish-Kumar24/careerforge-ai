// filepath: apps/frontend/types/interview.ts

export type InterviewMode = "practice" | "loop";
export type InterviewType = "DSA" | "AI_ML" | "SYSTEM_DESIGN" | "BEHAVIORAL" | "ROLE_SPECIFIC";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type SessionStatus = "in_progress" | "completed" | "expired" | "cancelled";
export type LoopStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface InterviewSession {
  _id: string;
  userId: string;
  mode: InterviewMode;
  type: InterviewType;
  difficulty: Difficulty;
  durationMinutes: 30 | 45 | 60;
  companyTag?: string;
  loopId?: string;
  roundNumber?: number;
  startTime?: string;
  endTime?: string;
  conversation: Array<{
    role: "ai" | "user" | "hint" | "system";
    content: string;
    timestamp: string;
  }>;
  status: SessionStatus;
  report?: {
    overallScore: number;
    categoryScores: {
      technicalAccuracy: number;
      problemSolving: number;
      communication: number;
      codeStructure: number;
    };
    perQuestionFeedback: Array<{
      questionIndex: number;
      question: string;
      answer: string;
      answerOriginal?: string;  // ✅ NEW: Original formatting for UI
      score: number;
      feedback: string;
      didNotAnswer?: boolean; 
    }>;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
    meta?: {                    // ✅ NEW: Optional metadata
      hintsUsed: number;
    };
  };
  createdAt: string;
}

export interface InterviewLoop {
  _id: string;
  userId: string;
  company: string;
  role: string;
  templateKey: string;
  rounds: Array<{
    roundNumber: number;
    type: InterviewType;
    difficulty: Difficulty;
    durationMinutes: 30 | 45 | 60;
    scheduledDate: string;
    sessionId?: string;
    status: "scheduled" | "completed" | "skipped";
  }>;
  status: LoopStatus;
  createdAt: string;
}

export interface SessionStartResponse {
  sessionId: string;
  startTime: string;
  durationMinutes: number;
  firstQuestion: string;
}

export interface LoopCreateResponse {
  loopId: string;
  company: string;
  role: string;
  schedule: Array<{
    roundNumber: number;
    type: InterviewType;
    scheduledDate: string;
    status: string;
  }>;
}

export interface AnswerResponse {
  nextQuestion: string;
  isFollowUp: boolean;
  remainingSeconds: number | null;
}

export interface HintResponse { hint: string; }

export interface ReportResponse {
  message: string;
  report: InterviewSession["report"];
  loopId?: string;
  roundNumber?: number;
}

export interface DashboardStats {
  totalSessions: number;
  avgScore: number | null;
  categoryAverages: {
    technicalAccuracy: number;
    problemSolving: number;
    communication: number;
    codeStructure: number;
  };
  trend: Array<{
    date: string; // "YYYY-MM-DD"
    avgScore: number;
    sessionCount: number;
  }>;
  loopProgress: Array<{
    loopId: string;
    company: string;
    role: string; 
    completed: number;
    total: number;
    completionRate: number;
  }>;
  recentSessions: Array<{
    sessionId: string;
    type: InterviewType;
    difficulty: Difficulty;
    companyTag?: string;
    score?: number;
    date: string;
  }>;
}