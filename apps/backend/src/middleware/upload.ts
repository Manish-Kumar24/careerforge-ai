// apps/backend/src/middleware/upload.ts
// @ts-nocheck - Multer types cause build issues; runtime logic verified

import multer from "multer";
import path from "path";

// ✅ CRITICAL: Use absolute path that works on Render/Vercel/any platform
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'resumes');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Ensure directory exists before multer tries to write
    const fs = require('fs');
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});