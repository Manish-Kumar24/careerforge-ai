// filepath: apps/backend/src/config/interviewTemplates.ts
import { InterviewType, Difficulty } from "../models/InterviewSession";

export type RoundTemplate = {
  roundNumber: number;
  type: InterviewType;
  difficulty: Difficulty;
  durationMinutes: 30 | 45 | 60;
  dayOffset: number;
};

export type CompanyTemplate = {
  key: string;
  company: string;
  role: string;
  description: string;
  rounds: RoundTemplate[];
};

export const INTERVIEW_TEMPLATES: Record<string, CompanyTemplate> = {
  meta_sde_2025: {
    key: "meta_sde_2025",
    company: "Meta",
    role: "Software Engineer",
    description: "Meta SDE interview loop: DSA → System Design → Behavioral",
    rounds: [
      { roundNumber: 1, type: "DSA", difficulty: "MEDIUM", durationMinutes: 45, dayOffset: 0 },
      { roundNumber: 2, type: "SYSTEM_DESIGN", difficulty: "MEDIUM", durationMinutes: 45, dayOffset: 3 },
      { roundNumber: 3, type: "BEHAVIORAL", difficulty: "MEDIUM", durationMinutes: 45, dayOffset: 6 }
    ]
  },
  google_swe_l3: {
    key: "google_swe_l3",
    company: "Google",
    role: "Software Engineer (L3)",
    description: "Google SWE loop: 2x DSA + 1x System Design + 1x Behavioral",
    rounds: [
      { roundNumber: 1, type: "DSA", difficulty: "MEDIUM", durationMinutes: 45, dayOffset: 0 },
      { roundNumber: 2, type: "DSA", difficulty: "HARD", durationMinutes: 45, dayOffset: 3 },
      { roundNumber: 3, type: "SYSTEM_DESIGN", difficulty: "MEDIUM", durationMinutes: 45, dayOffset: 6 },
      { roundNumber: 4, type: "BEHAVIORAL", difficulty: "EASY", durationMinutes: 30, dayOffset: 8 }
    ]
  },
  amazon_sde_i: {
    key: "amazon_sde_i",
    company: "Amazon",
    role: "SDE I",
    description: "Amazon SDE loop: OA → Technical Screen → Onsite",
    rounds: [
      { roundNumber: 1, type: "DSA", difficulty: "MEDIUM", durationMinutes: 60, dayOffset: 0 },
      { roundNumber: 2, type: "BEHAVIORAL", difficulty: "MEDIUM", durationMinutes: 45, dayOffset: 4 },
      { roundNumber: 3, type: "SYSTEM_DESIGN", difficulty: "MEDIUM", durationMinutes: 45, dayOffset: 7 }
    ]
  }
};

export const getTemplate = (templateKey: string): CompanyTemplate | undefined => {
  return INTERVIEW_TEMPLATES[templateKey];
};

export const listTemplates = (): CompanyTemplate[] => {
  return Object.values(INTERVIEW_TEMPLATES);
};

// ✅ FIX: Properly export this function
export const calculateRoundSchedule = (
  template: CompanyTemplate,
  startDate: Date = new Date()
): Array<{ roundNumber: number; scheduledDate: Date }> => {
  return template.rounds.map((round: RoundTemplate, idx: number) => ({
    roundNumber: round.roundNumber,
    scheduledDate: new Date(startDate.getTime() + round.dayOffset * 24 * 60 * 60 * 1000)
  }));
};

export const isRoundAvailable = (scheduledDate: Date, now: Date = new Date()): boolean => {
  const graceMs = 60 * 60 * 1000;
  return now.getTime() >= scheduledDate.getTime() - graceMs;
};

export const getNextAvailableRound = (
  rounds: Array<{ roundNumber: number; scheduledDate: Date; status: string }>,
  now: Date = new Date()
): number | null => {
  const available = rounds
    .filter(r => r.status === "scheduled")
    .find(r => isRoundAvailable(r.scheduledDate, now));
  return available ? available.roundNumber : null;
};