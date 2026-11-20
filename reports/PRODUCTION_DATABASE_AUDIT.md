# Production Database Audit Report
**Project:** DATUMOS  
**Date:** 2026-11-20  
**Branch:** main  
**Git commit:** 13295d6

## 1. Local Database Status

**Provider:** PostgreSQL 18  
**Connection:** `postgresql://datum_dev@127.0.0.1:5432/datum_dev`  
**Prisma schema:** Valid (`npx prisma validate` passed)

### 1.1 AuthUser Model Fields

| Field | Type | Notes |
|-------|------|-------|
| id | String @id @default(cuid()) | Primary key |
| email | String @unique | Unique constraint |
| name | String | |
| passwordHash | String | bcrypt hashed |
| role | String @default("MEMBER") | DIRECTOR, MEMBER, CLIENT, REVIT |
| active | Boolean @default(true) | Account active status |
| linkedEntityId | String? | |
| linkedEntityType | String? | |
| createdAt | DateTime @default(now()) | |
| updatedAt | DateTime @updatedAt | |

### 1.2 Local Auth Users (13 accounts)

All 13 accounts verified present with `active=true`. Passwords rotated with unique bcrypt hashes (work factor 10).

## 2. Production Database Status

**Provider:** Neon PostgreSQL (Neon project `datumos-db`, branch `main`, version 18, AWS US East 1)  
**Vercel project:** `datumos`  
**Production domain:** `datumos-datumcentral-bots-projects.vercel.app`

### 2.1 Access Limitation

Production database is **not accessible from this environment**. No Neon API token, no Vercel credentials, no direct database client access available.

### 2.2 Required Production Verification (Manual)

1. Connect to Neon Dashboard → `datumos-db` → `main` → SQL Editor
2. Verify `authUser` table exists
3. Verify `director@datumbim.com` account exists with `active=true`
4. Verify `passwordHash` field contains valid bcrypt hash
5. If missing or incorrect hash, reset Director password only:
   ```sql
   UPDATE authUser SET passwordHash = '<bcrypt hash>', active = true WHERE email = 'director@datumbim.com';
   ```

## 3. Database Connection Separation

- **Localhost:** `DATABASE_URL=postgresql://datum_dev@127.0.0.1:5432/datum_dev` (local PostgreSQL)
- **Production:** `DATABASE_URL` set in Vercel Production env vars (Neon URL)
- No cross-contamination between environments

## 4. Findings

| Finding | Severity | Status |
|---------|----------|--------|
| Production DB not accessible from this environment | High | Manual verification required |
| Production Director account existence unverified | High | Manual Neon SQL Editor check required |
| Local DB schema valid, 13 accounts rotated | — | Complete |
| `var/` directory gitignored (credentials file safe) | — | Compliant |
