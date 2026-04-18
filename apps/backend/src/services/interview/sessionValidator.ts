// apps/backend/src/services/interview/sessionValidator.ts

export const validateSubmissionTime = (
  startTime: Date,
  durationMinutes: number,
  submitTime: Date = new Date(),
  graceSeconds: number = 120
): boolean => {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  const graceEnd = new Date(endTime.getTime() + graceSeconds * 1000);
  return submitTime.getTime() <= graceEnd.getTime();
};

export const calculateRemainingTime = (
  startTime: Date,
  durationMinutes: number,
  now: Date = new Date()
): number => {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  const remainingMs = endTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(remainingMs / 1000)); // Return seconds
};

export const isSessionExpired = (
  startTime: Date,
  durationMinutes: number,
  now: Date = new Date()
): boolean => {
  return calculateRemainingTime(startTime, durationMinutes, now) <= 0;
};