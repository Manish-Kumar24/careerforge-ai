// apps\backend\src\middleware\auth.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ✅ Extend Express Request type to include user with flexible shape
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        _id?: string;
        id?: string;
        userId?: string;
        email?: string;
        [key: string]: any; // Allow additional properties from JWT
      };
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

    // ✅ Verify token synchronously
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // ✅ Type guard: jwt.verify can return string or JwtPayload
    if (typeof decoded === "string") {
      // This shouldn't happen with our JWT setup, but handle safely
      return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    // ✅ Safe assignment: decoded is now known to be JwtPayload
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};