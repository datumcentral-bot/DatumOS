# Role and Permission Audit Report
**Project:** DATUMOS  
**Date:** 2026-11-20  
**Branch:** main  
**Git commit:** 13295d6

## 1. Role Definitions (`src/lib/roles.mjs`)

| Role | Value |
|------|-------|
| DIRECTOR | "DIRECTOR" |
| MEMBER | "MEMBER" |
| CLIENT | "CLIENT" |
| REVIT | "REVIT" |

## 2. Portal Access Policy (`PORTAL_ACCESS`)

| Role | Allowed Path Prefixes |
|------|----------------------|
| DIRECTOR | /operations, /director, /workspace, /client, /revit, /console, /live |
| MEMBER | /operations, /workspace, /console, /live |
| CLIENT | /client, /console, /live |
| REVIT | /revit, /console, /live |

## 3. Home Map (Post-Login Redirect)

| Role | Landing Path |
|------|-------------|
| DIRECTOR | /director |
| MEMBER | /workspace |
| CLIENT | /client |
| REVIT | /revit |

## 4. Middleware Enforcement (`src/middleware.js`)

- **Session validation:** `getToken()` with `NEXTAUTH_SECRET`, plain cookie name `next-auth.session-token`, `secureCookie: false`
- **Unauthenticated access:** Redirect to `/login` with `callbackUrl`, or 401 for API routes
- **Role-based path enforcement:** `ROLE_PATHS[role]` checked against request pathname
- **CLIENT API restriction:** CLIENT role restricted to `CLIENT_ALLOWED_API_PREFIXES` (tenant-scoped endpoints only)
- **Public API prefixes:** `/api/auth`, `/api/neon-auth`, `/api/contact`, `/api/public`, `/api/newsletter` accessible without session
- **Write governance:** Non-GET methods blocked on non-public API routes (409 GOVERNED_WORKFLOW_REQUIRED)

## 5. Server-Side Role Guards (`src/lib/auth.js`)

- `requireAuth()` — throws 401 if no session
- `requireRole(...roles)` — throws 403 if role not in required list
- `guard(...requiredRoles)` — returns 401/403 Response or null
- `projectScopeWhere(session)` — Prisma where clause scoped by role
- `taskScopeWhere(session)` — Prisma where clause scoped by role

## 6. API-Level Authorization

- 205 route files, 478 exported handlers
- 473 handlers guarded in-route (385 session/role checks, 80 withAuth wrappers, 2 own-authorise proxies, 6 guarded local helpers)
- 5 unguarded by design (public form endpoints + health probes)

## 7. Findings

| Finding | Severity | Status |
|---------|----------|--------|
| Role hierarchy: Director > Admin > Member > Viewer | — | Admin role not explicitly in PORTAL_ACCESS (uses DIRECTOR paths) |
| CLIENT API restriction enforced at middleware level | — | Compliant |
| Server-side `guard()` and `requireRole()` available | — | Compliant |
| No UI-only access control (server-side enforcement) | — | Compliant |
| Middleware and API permissions agree | — | Compliant |

## 8. Notes

- The `Admin` role mentioned in the user's hierarchy is not explicitly defined in `ROLES` (DIRECTOR, MEMBER, CLIENT, REVIT only). Admin users would fall under DIRECTOR access paths.
- `/live` (LiveKit chat/meeting suite) is available to all four authenticated roles.
