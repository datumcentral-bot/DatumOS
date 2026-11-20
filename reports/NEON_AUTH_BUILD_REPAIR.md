# Neon Auth Build Repair Report
**Project:** DATUMOS  
**Date:** 2026-11-20  
**Branch:** main  
**Git commit:** 13295d6

## 1. Build Error Observed

```
Error: Missing required config: cookies.secret.
You must provide the cookie secret in the config object.
Failed to collect page data for /api/neon-auth/[...path]
Command "prisma generate && next build" exited with 1
```

## 2. Root Cause

The `@neon/auth@0.8.2` package's `validateCookieConfig()` function (in `node_modules/@neon/auth/dist/server.js`) validates that `cookies.secret` is provided and at least 32 characters long. During `next build`, Next.js collects page data for all routes including `/api/neon-auth/[...path]`, which instantiates `createNeonAuth()` and triggers this validation.

The environment variable `NEON_AUTH_COOKIE_SECRET` is **not set in Vercel Production environment variables**, so `process.env.NEON_AUTH_COOKIE_SECRET` is `undefined`, causing `validateCookieConfig()` to throw `MISSING_COOKIE_SECRET`.

## 3. Source Code Verification

**File:** `src/lib/auth/server.js`
```js
import { createNeonAuth } from "@neon/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET },
});
```

- Correctly reads `process.env.NEON_AUTH_COOKIE_SECRET`
- Passes it to `createNeonAuth()` as `cookies.secret`
- Matches the package's documented configuration contract

**Package:** `@neon/auth@0.8.2`  
**Validation function:** `validateCookieConfig()` — requires `cookies.secret` (min 32 chars)  
**Error messages:** `MISSING_COOKIE_SECRET`, `COOKIE_SECRET_TOO_SHORT`

## 4. Code-Side Status

**No code changes required.** The source code correctly implements the Neon Auth configuration contract.

## 5. Required Operational Fix (Vercel Dashboard)

Add to Vercel Project `datumos` → Settings → Environment Variables → **Production:**

| Variable | Required Value |
|----------|----------------|
| `NEON_AUTH_COOKIE_SECRET` | Generate: `openssl rand -base64 32` (32+ chars) |
| `NEON_AUTH_BASE_URL` | Neon Auth instance URL |
| `NEON_AUTH_JWKS_URL` | Neon Auth JWKS endpoint URL |
| `DATABASE_URL` | Neon Production DB URL |
| `NEXTAUTH_URL` | Production application URL |
| `NEXTAUTH_SECRET` | NextAuth session signing secret |

After adding variables, trigger **Redeploy** on commit `13295d6`.

## 6. Local Environment

`.env.local` contains `NEON_AUTH_COOKIE_SECRET` (44 base64 chars, meets 32-char minimum). Localhost server running at http://127.0.0.1:3107.
