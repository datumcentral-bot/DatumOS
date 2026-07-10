# DatumOS v11 — Real-Time BIM Project Management System

## Quick Start (local)
```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed          # seeds base data + v11 extensions
npm run build
npm run start            # http://localhost:3000
```
Dev mode: `npm run dev`

## Login
| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| DIRECTOR | director@datumbim.com  | DatumDir2026!  |
| MEMBER   | ahmed@datum-bim.com    | Member@2026!   |
| CLIENT   | khalid@bagc.ae         | Client@2026!   |

## What's new in v11
- **Clients** module — full CRUD, requirements, assessments, documents, board/list views
- **Client Projects** — detailed CRUD + file manager with viewer (Revit/Navisworks/PDF/DWG/Point Cloud/IFC)
- **ISO 19650** — BEP, MIDP/TIDP, CDE status codes, EIR/AIR, Responsibility Matrix
- **Task Board** — ClickUp-style Board / List / Calendar / Timeline views with DnD
- **Subcontractors** — team roster, project assignments, performance, live-feed placeholders
- **Reports & Analytics** — progress, utilization, financial, BIM coordination charts
- Reusable **comments / activity** threads on entities
- Full military theme (Orbitron + Rajdhani, olive/gold/tactical-dark, HUD)

## Deploy notes
- Auth is configured to work behind a Cloudflare tunnel (plain cookie names +
  getToken middleware). For a real HTTPS origin, re-enable secure cookies.
- For an always-on URL, deploy to Vercel + Neon Postgres using
  `prisma/schema.postgres.prisma` if present, or switch the datasource provider.
