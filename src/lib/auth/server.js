import { createNeonAuth } from "@neon/auth/next/server";

let auth;
const secret = process.env.NEON_AUTH_COOKIE_SECRET;
const baseUrl = process.env.NEON_AUTH_BASE_URL;

if (secret && baseUrl) {
  auth = createNeonAuth({
    baseUrl,
    cookies: { secret },
  });
}

// Build-time fallback: NEON_AUTH_COOKIE_SECRET / NEON_AUTH_BASE_URL are not
// available during `next build` on platforms where runtime env vars are
// injected at deploy time rather than build time. At runtime on Vercel, the
// secret will be present and createNeonAuth will be called with the real value.
if (!auth) {
  const emptyHandler = () =>
    new Response("Auth service not configured at build time", { status: 503 });
  auth = {
    handler: () => ({
      GET: emptyHandler,
      POST: emptyHandler,
      PUT: emptyHandler,
      DELETE: emptyHandler,
      PATCH: emptyHandler,
    }),
  };
}

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
