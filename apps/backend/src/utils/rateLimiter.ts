// filepath: apps/backend/src/utils/rateLimiter.ts

import rateLimit from "express-rate-limit";

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20
});