// apps/backend/src/types/express.d.ts
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload & {
        _id?: string;
        id?: string;
        userId?: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

export {}; // ✅ Required for .d.ts files to be treated as modules