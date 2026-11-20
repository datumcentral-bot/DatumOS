# Authentication Audit Report
**Project:** DATUMOS  
**Repository:** D:\DATUM_DEVELOPMENT\DatumOS  
**Date:** 2026-11-20  
**Branch:** main  
**Git commit:** 13295d6

## 1. Authentication Architecture

Two authentication systems operate in parallel:

### 1.1 NextAuth (Primary — `src/app/api/auth/[...nextauth]/route.js`)
- **Provider:** `CredentialsProvider` ("DatumOS Credentials")
- **User model:** `AuthUser` (Prisma schema line 981)
- **Lookup:** `prisma.authUser.findUnique({ where: { email: credentials.email.toLowerCase().trim() } })`
- **Active check:** `user.active` must be true
- **Password verification:** `bcrypt.compare(credentials.password, user.passwordHash)`
- **Session strategy:** JWT, 8-hour max age
- **Secret:** `process.env.NEXTAUTH_SECRET` (throws if missing — fail-closed)
- **Cookie names:** Plain (non-secure) — `next-auth.session-token`, `next-auth.callback-url`, `next-auth.csrf-token`
- **useSecureCookies:** false (Cloudflare tunnel compatibility)

### 1.2 Neon Auth / Managed Better Auth (`src/lib/auth/server.js`)
- **Package:** `@neon/auth@0.8.2`
- **Entry point:** `createNeonAuth()` from `@neon/auth/next/server`
- **Config:** `baseUrl: process.env.NEON_AUTH_BASE_URL`, `cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET }`
- **API route:** `src/app/api/neon-auth/[...path]/route.js` proxies to Neon Auth
- **Validation:** `validateCookieConfig()` requires `cookies.secret` (min 32 chars)
- **Endpoints:** `/sign-up/email`, `/sign-in/email`, `/get-session`, etc.

## 2. Database Schema — AuthUser Model

```
model AuthUser {
  id               String   @id @default(cuid())
  email            String   @unique
  name             String
  passwordHash     String
  role             String   @default("MEMBER")
  active           Boolean  @default(true)
  linkedEntityId   String?
  linkedEntityType String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

## 3. Local Auth Users (13 accounts)

| Email | Role | Active |
|-------|------|--------|
| director@datumbim.com | DIRECTOR | true |
| ahmed@datum-bim.com | MEMBER | true |
| faisal@kafd.sa | CLIENT | true |
| fatima@datum-bim.com | MEMBER | true |
| james@meridian-health.co.uk | CLIENT | true |
| john@datum-bim.com | MEMBER | true |
| khalid@bagc.ae | CLIENT | true |
| lisa@datum-bim.com | MEMBER | true |
| maria@datum-bim.com | MEMBER | true |
| noura@masdar-estates.ae | CLIENT | true |
| rania@u-a.ae | CLIENT | true |
| sarah@datum-bim.com | MEMBER | true |
| zain@datum-bim.com | MEMBER | true |

## 4. Password Rotation

All 13 accounts rotated with unique cryptographically strong passwords (bcrypt work factor 10). Credential handover file written to `var/credentials/auth-credentials-rotated.json` (gitignored via `var/` pattern).

## 5. Findings

| Finding | Severity | Status |
|---------|----------|--------|
| NEXTAUTH_SECRET required — fail-closed if missing | High | Resolved in code |
| Neon Auth cookies.secret required — build fails if missing | High | Source correct, needs Vercel env var |
| Plain (non-secure) cookie names — Cloudflare tunnel compatibility | Medium | Intentional |
| No hardcoded secrets in source | — | Compliant |
| .env.local gitignored | — | Compliant |

## 6. Local Login Verification

- URL: http://127.0.0.1:3107/login
- Director login: 302 redirect to /director, session cookie set, dashboard 200 OK
- All accounts rotated with new temporary passwords
