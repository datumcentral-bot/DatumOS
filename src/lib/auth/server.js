import { createNeonAuth } from "@neon/auth/next/server";

const emptyHandler = async () =>
  new Response(JSON.stringify({ error: "Neon Auth is not configured" }), {
    status: 503,
    headers: { "content-type": "application/json" },
  });

let GET = emptyHandler;
let POST = emptyHandler;
let PUT = emptyHandler;
let DELETE = emptyHandler;
let PATCH = emptyHandler;

const secret = process.env.NEON_AUTH_COOKIE_SECRET;
const baseUrl = process.env.NEXTAUTH_URL;

if (secret && baseUrl) {
  try {
    const a = createNeonAuth({ baseUrl, cookies: { secret } });
    if (a) {
      const h = a.handler();
      if (h?.GET) GET = h.GET;
      if (h?.POST) POST = h.POST;
      if (h?.PUT) PUT = h.PUT;
      if (h?.DELETE) DELETE = h.DELETE;
      if (h?.PATCH) PATCH = h.PATCH;
    }
  } catch {
    // Keep explicit 503 handlers if Neon Auth cannot initialize at build time.
  }
}

export { GET, POST, PUT, DELETE, PATCH };
