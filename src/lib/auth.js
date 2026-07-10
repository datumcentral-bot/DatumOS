/**
 * DatumOS Auth Helpers
 * Server-side session utilities, role guards, and scoping helpers.
 */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Re-export so API routes can `import { authOptions } from "@/lib/auth"`.
export { authOptions };

// ─── Role constants ────────────────────────────────────────────────────────
export const ROLES = {
  DIRECTOR: "DIRECTOR",
  MEMBER: "MEMBER",
  CLIENT: "CLIENT",
};

// ─── Portal access map ─────────────────────────────────────────────────────
export const PORTAL_ACCESS = {
  DIRECTOR: ["/director", "/workspace", "/client", "/console"],
  MEMBER: ["/workspace"],
  CLIENT: ["/client"],
};

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
      const status = err instanceof AuthError ? err.status : 500;
      return Response.json({ error: err.message }, { status });
    }
  };
}

// ─── Check if a path is accessible by a role ──────────────────────────────
export function canAccessPath(role, path) {
  if (!role) return false;
  const allowed = PORTAL_ACCESS[role] ?? [];
  return allowed.some((prefix) => path.startsWith(prefix));
}
