/**
 * DatumOS â€” Canonical Role & Portal Access Policy (pure module, framework-free).
 *
 * Single source of truth for roles and path-level access so the edge middleware
 * (src/middleware.js) and the API/server auth helpers (src/lib/auth.js) can never
 * drift apart. Kept dependency-free so it is unit-testable with `node --test`.
 */
export const ROLES = {
  DIRECTOR: "DIRECTOR",
  MEMBER: "MEMBER",
  CLIENT: "CLIENT",
  REVIT: "REVIT",
};

export const ROLE_LIST = Object.freeze(Object.values(ROLES));

/**
 * Role -> allowed path prefixes (kept in sync with middleware semantics).
 * `/live` is the shared chat + meeting suite (LiveKit) and is deliberately
 * available to EVERY authenticated role â€” each session gets its own room
 * identity (email), so all four roles can be in the same room at once.
 */
export const PORTAL_ACCESS = {
  DIRECTOR: ["/operations", "/director", "/workspace", "/client", "/revit", "/console", "/bim", "/live"],
  MEMBER: ["/operations", "/workspace", "/console", "/live"],
  CLIENT: ["/client", "/console", "/live"],
  REVIT: ["/revit", "/console", "/live"],
};

/** Role -> default landing path after login / when access is denied. */
export const HOME_MAP = {
  DIRECTOR: "/director",
  MEMBER: "/workspace",
  CLIENT: "/client",
  REVIT: "/revit",
};

/** Check whether a role may access a path (prefix match). */
export function canAccessPath(role, path) {
  if (!role) return false;
  const allowed = PORTAL_ACCESS[role] ?? [];
  return typeof path === "string" && allowed.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

export default { ROLES, ROLE_LIST, PORTAL_ACCESS, HOME_MAP, canAccessPath };
