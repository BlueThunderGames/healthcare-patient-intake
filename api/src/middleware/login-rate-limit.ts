import { rateLimit } from "express-rate-limit";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "Too many login attempts. Please try again later.",
    },
  },
});
