# DatumOS v12 — Full CRUD BIM Project Management System

## What's New in v12
- **Full CRUD on ALL modules** — every New/Edit/Delete button works with real DB
- **Toast notifications** — success/error/warning on every operation
- **ConfirmDialog** — safe delete with confirmation on all destructive actions
- **30 new/enhanced API routes** — GET/POST/PUT/DELETE for every entity
- **Datum Group logos fixed** — smaller logos that fit within card boundaries
- **New modules**: Leads (CRM), Invoices (Finance), Team Members, Subcontractors, Milestones, Coordination (RFIs), SOPs, Pre-Qualification, Resources, KPI, Communication

## Login Credentials
| Role | Email | Password |
|------|-------|----------|
| DIRECTOR | director@datumbim.com | DatumDir2026! |
| MEMBER | ahmed@datum-bim.com | Member@2026! |
| CLIENT | khalid@bagc.ae | Client@2026! |

## Running Locally
```bash
npm install
npx prisma generate
npx prisma db push
node prisma/seed-v11.mjs
npm run build
npm start
```

## Tech Stack
- Next.js 14 (App Router)
- Prisma + SQLite
- NextAuth.js
- Tailwind CSS + inline military styles (Orbitron + Rajdhani fonts)
