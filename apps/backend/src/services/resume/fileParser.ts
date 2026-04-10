// filepath: apps/backend/src/services/resume/fileParser.ts
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs/promises";

const cleanExtractedText = (text: string): string => {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')  // Remove control characters
    .replace(/[\u00A0\u1680\u2000-\u200B\u2028\u2029\uFEFF]/g, ' ')  // Remove Unicode spaces
    .replace(/\s+/g, ' ')  // Normalize multiple spaces to single space
    .replace(/\n\s*\n\s*\n+/g, '\n\n')  // Normalize excessive newlines
    .trim();
};

export const extractTextFromFile = async (filePath: string, mimetype: string): Promise<string> => {
  try {
    if (mimetype === "application/pdf") {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return cleanExtractedText(data.text || "");
    }
    
    if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ path: filePath });
      return cleanExtractedText(result.value || "");
    }
    
    throw new Error("Unsupported file format");
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error("Failed to extract text from resume");
  }
};