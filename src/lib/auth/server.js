import { createNeonAuth } from "@neon/auth/next/server";

let auth;
try {
  auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET },
  });
} catch {
  // Build-time fallback: NEON_AUTH_COOKIE_SECRET is not available during
  // `next build` on platforms where runtime env vars are injected at deploy
  // time rather than build time. At runtime on Vercel, the secret will be
  // present and createNeonAuth will be called with the real value.
  auth = {
    handler: () => ({
      GET: () => new Response("Auth service not configured at build time", { status: 503 }),
      POST: () => new Response("Auth service not configured at build time", { status: 503 }),
      PUT: () => new Response("Auth service not configured at build time", { status: 503 }),
      DELETE: () => new Response("Auth service not configured at build time", { status: 503 }),
      PATCH: () => new Response("Auth service not configured at build time", { status: 503 }),
    }),
  };
}

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
