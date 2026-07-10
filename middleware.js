/**
 * DatumOS — Next.js Edge Middleware
 * Protects portal routes and enforces role-based access control.
 *
 * Uses getToken() directly (instead of withAuth) so we can force a PLAIN
 * (non-secure) session cookie name. Behind a Cloudflare tunnel the browser is
 * on https but the origin sees http; next-auth's automatic __Secure- prefixing
 * otherwise desyncs the middleware cookie lookup from the cookie the handler
 * set, causing a post-login redirect loop.
 *
 * Protected routes:
 *   /director/*  → DIRECTOR only
 *   /workspace/* → DIRECTOR or MEMBER
 *   /client/*    → DIRECTOR or CLIENT
 *   /console     → any authenticated user
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const SECRET = process.env.NEXTAUTH_SECRET || "datumos-secret-key-2026-military-grade";
const COOKIE_NAME = "next-auth.session-token";

// Role → allowed path prefixes
const ROLE_PATHS = {
  DIRECTOR: ["/director", "/workspace", "/client", "/console"],
  MEMBER: ["/workspace", "/console"],
  CLIENT: ["/client", "/console"],
};

// Public path prefixes — no auth required
const PUBLIC_PREFIXES = [
  "/about",
  "/services",
  "/projects",
  "/resources",
  "/capabilities",
  "/contact",
  "/group",
  "/careers",
  "/login",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
  "/manifest",
  "/api/auth",
  "/api/newsletter",
  "/api/contact",
  "/api/quote",
  "/api/public",
  "/api/", // All API routes handle their own auth internally
];

function isPublicPath(pathname) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Public paths — always pass through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Decode the JWT session token, forcing the plain cookie name so it matches
  // what the auth handler set (works whether the origin sees http or https).
  const token = await getToken({
    req,
    secret: SECRET,
    cookieName: COOKIE_NAME,
    secureCookie: false,
  });
  const role = token?.role;

  // No token on a protected route → redirect to login
  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowed = ROLE_PATHS[role] ?? [];
  const hasAccess = allowed.some((prefix) => pathname.startsWith(prefix));

  if (!hasAccess) {
    const homeMap = { DIRECTOR: "/director", MEMBER: "/workspace", CLIENT: "/client" };
    return NextResponse.redirect(new URL(homeMap[role] ?? "/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static assets & files.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)",
  ],
};