import type { CookieOptions } from "express";
import { env } from "./env.js";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const sharedCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} satisfies CookieOptions;

export const sessionCookieOptions = {
  ...sharedCookieOptions,
  maxAge: SESSION_TTL_MS,
} satisfies CookieOptions;

export const clearSessionCookieOptions = {
  ...sharedCookieOptions,
} satisfies CookieOptions;
