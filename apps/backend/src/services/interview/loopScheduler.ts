// apps/backend/src/services/interview/loopScheduler.ts

import { CompanyTemplate, RoundTemplate } from "../../config/interviewTemplates";

export const calculateRoundSchedule = (
  template: CompanyTemplate,
  startDate: Date = new Date()
): Array<{ roundNumber: number; scheduledDate: Date }> => {
  return template.rounds.map((round: RoundTemplate) => ({
    roundNumber: round.roundNumber,
    scheduledDate: new Date(startDate.getTime() + round.dayOffset * 24 * 60 * 60 * 1000)
  }));
};

export const isRoundAvailable = (scheduledDate: Date, now: Date = new Date()): boolean => {
  // Allow starting up to 1 hour before scheduled time (grace period)
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