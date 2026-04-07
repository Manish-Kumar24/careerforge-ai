// apps\backend\src\middleware\auth.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ✅ Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Invalid token format" });
    }

    // ✅ Use jwt.verify SYNCHRONOUSLY (no callback) - eliminates hanging
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);
    // ✅ Always return after sending response
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};