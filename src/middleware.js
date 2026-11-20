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
// Canonical role/path policy from src/lib/roles.mjs — keeps the edge runtime
// and server-side auth helpers on the same access matrix.
import { PORTAL_ACCESS as ROLE_PATHS, HOME_MAP } from "@/lib/roles.mjs";

// SECURITY (2026-10-10): the previous value here was a hardcoded secret literal
// that was published in source. It is deliberately NOT reproduced in this
// comment, so the comment cannot re-publish it. If NEXTAUTH_SECRET was ever
// unset in a deployment, every session cookie became forgeable — including a
// cookie claiming role: DIRECTOR. Anyone who saw the old value should still
// treat it as compromised.
//
// The auth handler in src/app/api/auth/[...nextauth]/route.js already refuses to
// start without NEXTAUTH_SECRET, so this fallback contradicted it: the handler
// failed closed while the edge middleware used the published key. Both now fail
// closed together.
//
// No secret value is rotated by this change and no replacement is introduced.
// Consequences of deploying it, stated precisely:
//   * Where NEXTAUTH_SECRET IS set  -> unchanged behaviour, and no session is
//     invalidated, because the fallback was never reached in the first place.
//   * Where it is NOT set -> the edge middleware now denies protected traffic
//     instead of accepting forgeable cookies. That is the intended fail-closed
//     behaviour, and it is also a hard stop for anyone relying on the published
//     key.
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
  "/api/auth", // NextAuth sign-in / callbacks
  "/api/neon-auth", // Neon Auth (Managed Better Auth) sign-up / sign-in / session
  "/api/contact", // public quote + enquiry form
  "/api/public", // public website lead capture
  "/api/newsletter", // public newsletter sign-up
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
  // Isolated operations release: legacy mutations cannot bypass revision and QA policies.
  if (pathname === '/operations/login') return NextResponse.next();
  if (pathname === '/api/operations/integration') return NextResponse.next(); // bearer checked in handler
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/neon-auth/') && !pathname.startsWith('/api/operations') && !['/api/contact','/api/public/lead'].includes(pathname)) {
    return NextResponse.json({error:{code:'GOVERNED_WORKFLOW_REQUIRED',message:'Use the operations workflow for changes; legacy writes are disabled in this isolated release.'}}, {status:409});
  }


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

  const isApi = pathname.startsWith("/api/");

  // No token on a protected route → redirect pages, 401 for API callers
  if (!role) {
    if (isApi) {
      if (!isPublicApi(pathname)) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }
    const loginUrl = new URL(pathname.startsWith("/operations")?"/operations/login":"/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // API routes: a valid session is enough, handlers enforce finer-grained roles.
  //
  // EXCEPTION (2026-10-10) — the CLIENT role is blocked from internal API data.
  //
  // Historical context (state BEFORE the 2026-10-10 hardening, measured then):
  // many handlers had no in-handler authorisation and none of those scoped
  // records to a tenant. A real CLIENT session therefore received HTTP 200 on
  // every internal endpoint probed, including live rows from /api/risks (6),
  // /api/team (8), /api/raci (7), /api/milestones (24) and /api/lessons (5).
  // Endpoints that returned 0 rows were empty in that database, not protected.
  //
  // CURRENT STATE (reconciled 2026-10-10 from source, tools/count-handlers.mjs):
  //   205 route files · 478 exported handlers · 473 guarded in-route
  //   (385 in-handler session/role checks · 80 withAuth wrappers ·
  //    2 own-authorise proxies · 6 guarded local helpers)
  //   · 5 unguarded by design (POST /api/contact, POST /api/public/lead,
  //    POST /api/newsletter — public form endpoints in PUBLIC_API_PREFIXES;
  //    GET /api/health, GET /api/livekit/health — static infra probes).
  //   /api/auth/[...nextauth] is a framework route, public by design.
  //
  // This rule is deliberate defence-in-depth, NOT a substitute for per-handler
  // authorisation. CLIENT users reach their own records only through the
  // portal endpoints listed below.
  // /api/auth must stay reachable for every signed-in role: NextAuth's own
  // /api/auth/session endpoint is what useSession() and the role in the UI are
  // read from. Blocking it here logs clients out of their own portal.
  //
  // This allowlist is derived from the endpoints the client portal screens
  // actually call, not from an optimistic guess:
  //   /api/client        -> client-projects and the portal's own endpoints
  //   /api/projects      -> client project list and project detail  (scoped by handler)
  //   /api/invoices      -> client invoice page                      (scoped by handler)
  //   /api/bim/cde       -> client documents                         (scoped by handler)
  //   /api/bim-meetings  -> client meetings                          (scoped by handler)
  //   /api/knowledge     -> client knowledge base (role-aware visibility in handler)
  //   /api/ai/chat       -> shared chat widget
  //   /api/upload        -> shared upload component
  //   /api/comments      -> shared comment component
  //   /api/admin/data    -> POST-only and DIRECTOR-only already; clients gain nothing
  // Every entry above is either tenant-scoped in its own handler or carries its
  // own role check. Anything NOT listed is refused for the CLIENT role.
  const CLIENT_ALLOWED_API_PREFIXES = [
    "/api/client",
    "/api/projects",
    "/api/invoices",
    "/api/bim/cde",
    "/api/bim-meetings",
    "/api/knowledge",
    "/api/ai/chat",
    "/api/upload",
    "/api/comments",
    "/api/auth",
  ];

  if (isApi) {
    if (role === "CLIENT" && !CLIENT_ALLOWED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  const allowed = ROLE_PATHS[role] ?? [];
  const hasAccess = allowed.some((prefix) => pathname.startsWith(prefix));

  if (!hasAccess) {
    return NextResponse.redirect(new URL(HOME_MAP[role] ?? "/login", req.url));
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
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|apple-icon\\.png|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|woff|woff2|ttf|eot|otf|mp4|webm|ogv|mov|m4v|vtt|srt|txt|xml|json|pdf|zip)).*)",
  ],
};