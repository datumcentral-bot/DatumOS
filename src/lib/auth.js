/**
 * DatumOS Auth Helpers
 * Server-side session utilities, role guards, and scoping helpers.
 */
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Re-export so API routes can `import { authOptions } from "@/lib/auth"`.
export { authOptions };

// ─── Role constants, portal access map & home map ─────────────────────────
// Canonical policy lives in src/lib/roles.mjs — the single source of truth
// shared with the edge middleware (src/middleware.js). Imported here (not
// re-exported via `export { X } from`) because the scope helpers below
// reference `ROLES` directly; a re-export creates NO local binding and the
// compiled route chunks would ReferenceError on `ROLES` at request time.
import { ROLES, ROLE_LIST, PORTAL_ACCESS, HOME_MAP, canAccessPath } from "@/lib/roles.mjs";
import { errorResponse } from "@/lib/api-errors";
export { ROLES, ROLE_LIST, PORTAL_ACCESS, HOME_MAP, canAccessPath };

// ─── Get session (server components / API routes) ──────────────────────────
export async function getSession() {
  return getServerSession(authOptions);
}

// ─── Require auth — returns session or throws 401 ─────────────────────────
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new AuthError(401, "Unauthenticated");
  }
  return session;
}

// ─── Require specific role(s) ─────────────────────────────────────────────
export async function requireRole(...roles) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    throw new AuthError(403, `Requires role: ${roles.join(" or ")}`);
  }
  return session;
}

// ─── Scope helpers ────────────────────────────────────────────────────────

/** For MEMBER: returns the linked team-member User.id */
export function getMemberEntityId(session) {
  return session?.user?.linkedEntityId ?? null;
}

/** For CLIENT: returns the linked Client.id */
export function getClientEntityId(session) {
  return session?.user?.linkedEntityId ?? null;
}

/** Build a Prisma `where` clause that scopes projects to the session user */
export function projectScopeWhere(session) {
  const role = session?.user?.role;
  if (role === ROLES.DIRECTOR) return {}; // no restriction
  if (role === ROLES.MEMBER) {
    const memberId = getMemberEntityId(session);
    if (!memberId) return { id: "NONE" };
    return { assignments: { some: { userId: memberId } } };
  }
  if (role === ROLES.CLIENT) {
    const clientId = getClientEntityId(session);
    if (!clientId) return { id: "NONE" };
    return { clientId };
  }
  return { id: "NONE" };
}

/** Build a Prisma `where` clause that scopes tasks to the session user */
export function taskScopeWhere(session) {
  const role = session?.user?.role;
  if (role === ROLES.DIRECTOR) return {};
  if (role === ROLES.MEMBER) {
    const memberId = getMemberEntityId(session);
    if (!memberId) return { id: "NONE" };
    return { assigneeId: memberId };
  }
  if (role === ROLES.CLIENT) {
    const clientId = getClientEntityId(session);
    if (!clientId) return { id: "NONE" };
    return { project: { clientId } };
  }
  return { id: "NONE" };
}

// ─── Auth error class ─────────────────────────────────────────────────────
export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ─── API route helper: wrap handler with auth check ───────────────────────
export function withAuth(handler, ...requiredRoles) {
  return async function (req, ctx) {
    try {
      const session =
        requiredRoles.length > 0
          ? await requireRole(...requiredRoles)
          : await requireAuth();
      return handler(req, ctx, session);
    } catch (err) {
      // AuthError from requireRole/requireAuth carries .status;
      // errorResponse classifies it and logs redacted diagnostics.
      return errorResponse(err, req);
    }
  };
}

// ─── Drop-in guard for existing handlers ──────────────────
// RR-02 (2026-10-10): 141 of 205 handlers had no in-handler
// authorisation. MEMBER and REVIT sessions could reach them
// because the edge middleware only gates the CLIENT role.
// This lets a handler enforce session + role server-side
// without restructuring:
//
//   const denied = await guard("DIRECTOR", "MEMBER");
//   if (denied) return denied;
//
// Returns a 401/403 Response when access is refused, or null
// when the caller may proceed. With no roles it only requires
// a session (any authenticated role). It reads the session the
// same way requireAuth() does, so behaviour matches the
// existing guards. Handler-thrown errors are NOT caught here;
// the handler keeps its own try/catch (sanitised under RR-05).
export async function guard(...requiredRoles) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (requiredRoles.length > 0 && !requiredRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// ─── Check if a path is accessible by a role (canonical: roles.mjs) ───────
// (canAccessPath is imported + re-exported above, alongside ROLES.)
