// apps/backend/src/services/interview/pdfGenerator.ts

// ✅ FIX: Use require for CommonJS compatibility
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require("pdfkit");

import { AIReportResponse } from "./aiOrchestrator";

export const generateReportPDF = async (report: AIReportResponse, sessionId: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers: Buffer[] = [];
    
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("Mock Interview Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).font("Helvetica").text(`Session ID: ${sessionId}`, { align: "center" });
    doc.moveDown(2);

    // Overall Score
    doc.fontSize(16).font("Helvetica-Bold").text("Overall Score");
    doc.fontSize(24).fillColor("#2563EB").text(`${report.overallScore}/100`, { align: "center" });
    doc.fillColor("#000000");
    doc.moveDown();

    // Category Scores
    doc.fontSize(14).font("Helvetica-Bold").text("Category Breakdown");
    doc.fontSize(11).font("Helvetica");
    Object.entries(report.categoryScores).forEach(([key, value]: [string, any]) => {
      const label = key.replace(/([A-Z])/g, " $1").trim();
      doc.text(`${label}: ${value}/100`);
    });
    doc.moveDown();

    // Strengths
    doc.fontSize(14).font("Helvetica-Bold").text("Strengths");
    doc.fontSize(11).font("Helvetica");
    report.strengths.forEach(s => doc.text(`• ${s}`));
    doc.moveDown();

    // Improvements
    doc.fontSize(14).font("Helvetica-Bold").text("Areas for Improvement");
    doc.fontSize(11).font("Helvetica");
    report.improvements.forEach(s => doc.text(`• ${s}`));
    doc.moveDown();

    // Next Steps
    doc.fontSize(14).font("Helvetica-Bold").text("Recommended Next Steps");
    doc.fontSize(11).font("Helvetica");
    report.nextSteps.forEach((step, i) => doc.text(`${i + 1}. ${step}`));

    doc.end();
  });
};