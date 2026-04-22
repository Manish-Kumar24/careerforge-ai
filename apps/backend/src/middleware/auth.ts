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
        [key: string]: any; 
      };
    }
  }
}

// ✅ FIX 1: Return type is `void` (not Promise<void>) because function is NOT async
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // ✅ FIX 2: Call res.json() without return, then explicit void return
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return; // ✅ Explicit void return to exit early
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ error: "Unauthorized: Invalid token format" });
      return;
    }

    // ✅ Verify token synchronously
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // ✅ Type guard: jwt.verify can return string or JwtPayload
    if (typeof decoded === "string") {
      res.status(401).json({ error: "Unauthorized: Invalid token payload" });
      return; // ✅ Explicit void return
    }

    // ✅ Safe assignment: decoded is now known to be JwtPayload
    req.user = decoded;
    next(); // ✅ Continue to next middleware/route
    // ✅ No return needed at end - function ends naturally with void
    
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    // ✅ No return needed - response already sent
  }
};