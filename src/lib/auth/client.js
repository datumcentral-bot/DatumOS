import { createAuthClient } from "@neon/auth/next";

export const authClient =
  typeof process.env.NEON_AUTH_BASE_URL === "string" &&
  process.env.NEON_AUTH_BASE_URL.length > 0
    ? createAuthClient()
    : createAuthClient({ baseUrl: process.env.NEON_AUTH_BASE_URL ?? "" });
