import { createNeonAuth } from "@neon/auth/next/server";

const emptyHandler = () =>
  new Response("Auth service not configured at build time", { status: 503 });

let GET = emptyHandler;
let POST = emptyHandler;
let PUT = emptyHandler;
let DELETE = emptyHandler;
let PATCH = emptyHandler;

const secret = process.env.NEON_AUTH_COOKIE_SECRET;
const baseUrl = process.env.NEON_AUTH_BASE_URL;

if (secret && baseUrl) {
  try {
    const a = createNeonAuth({ baseUrl, cookies: { secret } });
    const h = a.handler();
    if (h.GET) GET = h.GET;
    if (h.POST) POST = h.POST;
    if (h.PUT) PUT = h.PUT;
    if (h.DELETE) DELETE = h.DELETE;
    if (h.PATCH) PATCH = h.PATCH;
  } catch {
    // Keep empty handlers if createNeonAuth throws at build time
  }
}

export { GET, POST, PUT, DELETE, PATCH };
