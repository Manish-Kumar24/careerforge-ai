import { parse } from "csv-parse/sync";

export function parseCSV(csvContent: string) {
  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

export function normalizeString(str: string): string {
  return str.trim().toLowerCase();
}

export function parseArrayField(field: string): string[] {
  if (!field) return [];
  return field
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function normalizeDifficulty(difficulty: string): "easy" | "medium" | "hard" {
  const d = difficulty.toLowerCase();
  if (d.includes("easy")) return "easy";
  if (d.includes("hard")) return "hard";
  return "medium";
}

export function normalizePlatform(platform: string): "leetcode" | "geeksforgeeks" {
  const p = platform.toLowerCase();
  if (p.includes("geeks") || p.includes("gfg")) return "geeksforgeeks";
  return "leetcode";
}