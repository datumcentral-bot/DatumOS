# GitHub Vercel Deployment Register
**Project:** DATUMOS  
**Repository:** datumcentral-bot/DatumOS  
**Branch:** main  
**Production Platform:** Vercel  
**Database:** Neon PostgreSQL (datumos-db, main branch)

## Mission Rules (Adopted)

1. Every verified code change → commit → push GitHub → deploy Vercel → verify production → record evidence
2. Continuous workflow — not a final-stage activity
3. Never commit secrets, passwords, tokens, database URLs, or environment files
4. Never force-push or rewrite Git history
5. Deployment successful only when Vercel reports Ready AND live production checks pass
6. Register every repair in this file

---

## Register Entries

| # | Phase | Change | Tests | Commit SHA | GitHub Push | Vercel Deploy ID | Deployment Status | Production Test | Outstanding Issue |
|---|-------|--------|-------|------------|-------------|------------------|-------------------|-----------------|-------------------|
| 1 | fix(neon-auth) | Add Neon Auth email signup — server.js, client.js, route.js, sign-up page, middleware whitelist | Local signup verified (200 OK + session) | 3b24b11 | Pushed | — | Not deployed | Not tested | Vercel env vars missing |
| 2 | fix(deploy) | Add .npmrc with legacy-peer-deps=true to resolve @neon/auth peer conflict with Next.js 14 | Local install verified | 13295d6 | Pushed | — | Failed | Not tested | NEON_AUTH_COOKIE_SECRET missing in Vercel Production |
| 3 | fix(auth) | Add 7 repair audit reports (auth, neon-auth build, production DB, RBAC, security rotation, deploy, final verification) | Local login verified (302 → /director, dashboard 200) | 39d5fa1 | Pushed | — | Not deployed | Not tested | Vercel env vars missing; Production Director password not verified |
| 4 | fix(deploy) | Add GitHub Vercel deployment register per Phase K workflow | Git diff --check clean; push verified | 8c029ab | Pushed | — | Not deployed | Not tested | Vercel env vars missing; Production Director password not verified |

## Pending Vercel Deployment Actions

**Required Environment Variables (Vercel Dashboard → datumos → Settings → Environment Variables → Production):**

| Variable | Required Value |
|----------|----------------|
| `NEON_AUTH_COOKIE_SECRET` | Generate: `openssl rand -base64 32` |
| `NEON_AUTH_BASE_URL` | `https://ep-silent-morning-b81s4sx7.neonauth.c-14.us-east-1.aws.neon.tech/neondb/auth` |
| `NEON_AUTH_JWKS_URL` | `https://ep-silent-morning-b81s4sx7.neonauth.c-14.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json` |
| `DATABASE_URL` | Neon Production DB URL |
| `NEXTAUTH_URL` | `https://datumos-datumcentral-bots-projects.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth session signing secret |

**After adding variables:**
1. Deployments → Redeploy on commit `39d5fa1`
2. Monitor build logs until final status
3. Verify production URL: `datumos-datumcentral-bots-projects.vercel.app`
4. Test Director login at production URL

## Localhost Status (Verified)

- Server: http://127.0.0.1:3107 — Running
- Director login: 302 → /director, session cookie set, dashboard 200 OK
- Neon Auth signup: 200 OK + active session
- 13 auth users rotated with unique bcrypt passwords (work factor 10)
- Credential handover: `var/credentials/auth-credentials-rotated.json` (gitignored)

## Security

- No secrets committed to GitHub
- `.env.local` gitignored
- `var/` directory gitignored
- GitHub and Vercel tokens shared in prior chat should be rotated immediately
