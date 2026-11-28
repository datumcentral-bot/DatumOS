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
 *
 * Public API endpoints:
 *   /api/auth           - NextAuth sign-in / callbacks
 *   /api/neon-auth      - Neon Auth (Managed Better Auth) sign-up / sign-in / session
 *   /api/contact        - public quote + enquiry form
 *   /api/public         - public website lead capture
 *   /api/newsletter     - public newsletter sign-up
 *   /api/status         - system status check
 *   /api/health         - health check endpoint
 */

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
// Canonical role/path policy from src/lib/roles.mjs — keeps the edge runtime
// and server-side auth helpers on the same access matrix.
import { PORTAL_ACCESS as ROLE_PATHS, HOME_MAP } from "@/lib/roles.mjs";

// SECURITY (2026-10-10): the previous value here was a hardcoded secret literal
// that was published in source. It is deliberately NOT reproduced in this
// comment, so the comment cannot re-publish it. If NEXTAUTH_SECRET was ever
// unset in a deployment, every session cookie became forgeable — including a
// cookie claiming role: DIRECTOR. Anyone who saw the old value should still
// treat it as compromised.
// The auth handler in src/app/api/auth/[...nextauth]/route.js already refuses to
// start without NEXTAUTH_SECRET, so this fallback contradicted it: the handler
// failed closed while the edge middleware used the published key. Both now fail
// closed together.
// No secret value is rotated by this change and no replacement is introduced.
// Consequences of deploying it, stated precisely:
//   * Where NEXTAUTH_SECRET IS set  -> unchanged behaviour, and no session is
//     invalidated, because the fallback was never reached in the first place.
//   * Where it is NOT set -> the edge middleware now denies protected traffic
//     instead of accepting forgeable cookies. That is the intended fail-closed
//     behaviour, and it is also a hard stop for anyone relying on the published key.
// Production session invalidation is NOT expected, but it cannot be asserted
// without confirming the production environment variable. See the risk register.
const SECRET = process.env.NEXTAUTH_SECRET;

if (!SECRET) {
  console.error(
    "[middleware] NEXTAUTH_SECRET is not set. Refusing to evaluate session tokens; protected routes are denied."
  );
}

const COOKIE_NAME = "next-auth.session-token";

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
  "/privacy",
  "/samples",
  "/client-journey",
  "/login",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
  "/manifest",
];

// Public API endpoints — reached by anonymous visitors, so they stay open.
// Every other /api/* route now requires a session. The previous blanket "/api/"
// allowance exposed internal records (invoices, projects, financial, SOPs) to
// unauthenticated callers, because many handlers never call requireAuth().
const PUBLIC_API_PREFIXES = [
  "/api/auth",          // NextAuth sign-in / callbacks
  "/api/neon-auth",     // Neon Auth (Managed Better Auth) sign-up / sign-in / session
  "/api/contact",       // public quote + enquiry form
  "/api/public",        // public website lead capture
  "/api/newsletter",    // public newsletter sign-up
  "/api/status",        // system status check
  "/api/health",        // health check endpoint
];

function isPublicPath(pathname) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isPublicApi(pathname) {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: SECRET, cookieName: COOKIE_NAME });

  // Public paths and public APIs need no session
  if (isPublicPath(pathname) || isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // No session → redirect to login (with callback to return after sign-in)
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  // API routes only require authentication — role-based access is enforced
  // server-side in each handler via withAuth()/requireAuth(). Do not apply
  // PORTAL_ACCESS path rules to /api/* here, or authenticated calls would be
  // redirected away from the API endpoint they are trying to reach.
  if (!pathname.startsWith("/api/")) {
    // Check role-based access using canonical policy
    const allowedPrefixes = ROLE_PATHS[role] ?? [];
    const hasAccess = allowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );

    if (!hasAccess) {
      const home = HOME_MAP[role] || "/login";
      return NextResponse.redirect(new URL(home, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static assets & files.
     *
     * The extension list must include every asset type we actually serve from
     * public/. Before mp4/webm/srt were added, a request for
     * /media/datum-mep-service-intro.mp4 fell through to this middleware and
     * returned the app shell instead of the video. Keep this list in step with
     * anything added to public/.
     */
    "/((?!_next/static|_next/image|favicon\.ico|icon\.png|apple-icon\.png|manifest\.json|.*\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|woff|woff2|ttf|eot|otf|mp4|webm|ogv|mov|m4v|vtt|srt|txt|xml|json|pdf|zip)).*)",
  ],
};