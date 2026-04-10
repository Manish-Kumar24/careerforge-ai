// apps/backend/src/services/resume/jdParser.ts

// ✅ Text-only version: only cleanJDText, no URL scraping

export const cleanJDText = (rawText: string): string => {
  return rawText
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);
};