# DatumOS — DATUM BIM ENGINEERING

**Custom ERP + Client Portal + Public Website for DATUM BIM ENGINEERING**
_Building Information Modeling · Architecture · Structure · MEP · Scan-to-BIM · Shop Drawings_
_Head office: Lahore, Pakistan · Regional offices: Dubai, Karachi, Islamabad · CEO: Syed Asad Abrar · Est. 2021._

DatumOS unifies the **public marketing website**, business development, project delivery and client
collaboration into a single web application with **three internal portals + a full public site**,
covering all seven service divisions: Architecture (AR), Structural (ST), Mechanical/HVAC (ME),
Electrical (EL), Plumbing (PL), Fire Protection (FP), and the flagship **BIM & Digital Delivery (BIM)**.

Fully branded with the real **DATUM BIM** navy-emblem logo, olive-green + sand military UI, and
ISO 19650 content sourced directly from the DATUM BIM Company Profile & BIM Services documents
(5-Point Delivery Assurance, 20-point QA/QC process, LOD framework, real landmark portfolio, the
Datum Group of companies, real KPIs, certifications and contact details).

---

## 🌍 Live demo (public URL)

A running instance is exposed via a Cloudflare quick tunnel. **The exact hostname is written to
`PUBLIC_URL.txt` in the project root** (it changes if the tunnel restarts). At the time of packaging
it was:

**https://org-thee-skill-moms.trycloudflare.com**

| Portal | Live link (append to the base URL above) |
|---|---|
| Public website / home | `/` |
| Director's Command Center | `/director` |
| CRM Pipeline (drag & drop) | `/director/crm` |
| Internal Workspace | `/workspace` |
| Client Portal | `/client` |

> ⚠️ This is a **temporary, account-less quick-tunnel**: it only stays live while the sandbox process
> runs and can rotate its URL on reconnect. Single-user browsing works well; it is **not** meant for
> production load. For a **permanent, always-on** public URL, follow
> **[Deploying to a permanent host](#-deploying-to-a-permanent-host-vercel--postgres)** below
> (Vercel + Neon/Supabase Postgres — fully scripted).

---

## ✨ Drag & drop (new)

Both Kanban-style boards now use **[@dnd-kit](https://dndkit.com/)** for smooth, accessible drag-and-drop
(the old left/right arrow buttons are gone):

- **Director → CRM Pipeline:** grab a lead card by its **grip handle** (⋮⋮) and drag it between the five
  stages `To Contact → Contacted → Meeting Booked → Proposal Sent → Won`. The stage + win-probability
  persist to the DB instantly (optimistic UI with rollback on failure).
- **Internal Workspace → open a project → Task board:** drag a task card between
  `To Do → In Progress → QA Review → Done`. The **mandatory QA/QC gate is fully enforced** — dropping a
  task into **Done** while its checklist is incomplete is **blocked** (a toast explains why and the Done
  column highlights red); the server re-validates the gate and records a QA sign-off only when every item
  is ticked. Open the task to work the checklist.

---

## ⚡ Quick start (4 commands)

> Requires **Node.js 18+** (tested on Node 20). No external database server needed — the whole
> database is a single local SQLite file (`prisma/dev.db`).

```bash
npm install                       # 1. install dependencies
npx prisma migrate dev --name init  # 2. create the SQLite DB + tables
npm run db:seed                   # 3. load realistic dummy data (skip if migrate already seeded)
npm run dev                       # 4. start the app
```

Then open **http://localhost:3000**.

> 💡 **Even faster:** `npm install && npm run setup` runs generate + migrate + seed in one go.
> (Note: `prisma migrate dev` auto-runs the seed the first time, so step 3 is only needed to re-seed.)

To wipe and reload the sample data at any time:
```bash
npm run db:seed
```

---

## 🧭 The three portals

Open the home page (`/`) to pick a portal, or jump straight in:

| Portal | URL | For | Highlights |
|---|---|---|---|
| **Director's Command Center** | `/director` | Owner / Director | Executive KPIs (MRR, Active Projects, Cash Flow, Team Utilisation), CRM Kanban pipeline with 25/day outreach KPI, Project Portfolio (R/A/G health), Financial Control (invoices, expenses, margin analysis), Team Management (assignments, timesheets, QA/QC sign-offs) |
| **Internal Workspace** | `/workspace` | BIM Coordinators, Modelers, QA | Project workspaces mirroring the delivery folder structure, SOP-driven Task engine with **mandatory QA/QC checklist gates**, Document Control with file-naming enforcement, Time Tracking, Clash & RFI tracker |
| **Client Portal** | `/client` | International clients | Project progress + milestones, secure **read-only** document vault, Reviews & Approvals with digital markups, communication hub with weekly status reports, billing view |

You can switch portals any time from the **"Switch Portal"** section at the bottom of each sidebar.

---

## ✨ Things to try (interactive, writes to the DB)

- **Director → CRM Pipeline:** **drag** a lead card (by its ⋮⋮ grip handle) between the pipeline
  columns `To Contact → Contacted → Meeting Booked → Proposal Sent → Won`. Use the **+1 / +5** buttons to log today's outreach touches (updates the 25/day KPI live).
- **Internal Workspace → open a project → Task board:** **drag** a task between the status columns.
  Dropping into **Done** is gated — a task **cannot be moved to Done** until every item on its
  **mandatory QA/QC checklist** is ticked (open the task to work the checklist). A QA sign-off is
  recorded automatically when the gate passes.
- **Workspace → Document Control:** type a file name into the validator to test it against the
  studio standard `DS-2401-ST-Z01-DWG-R03`. Non-standard files in the register are flagged.
- **Client Portal → Reviews & Approvals:** **Approve** a deliverable or **Request changes** with a
  digital markup note.
- **Client Portal → open a project → Communication Hub:** send a message to the delivery team.

All of the above persist to the local SQLite database.

---

## 🗄️ Data model (Prisma / SQLite)

Full schema in [`prisma/schema.prisma`](prisma/schema.prisma). Key entities:

- **People/Orgs:** `User` (team), `Client`, `ClientUser`
- **Divisions:** `Division` (7 service divisions, BIM flagged as flagship)
- **CRM:** `Lead` (pipeline stages), `OutreachActivity` (25/day KPI)
- **Projects:** `Project` (health R/A/G, progress, est vs actual hrs), `ProjectDivision`,
  `ProjectAssignment`, `Milestone`, `ProjectFolder` (CDE folder structure)
- **Delivery:** `Sop` + `SopChecklistItem`, `Task` + `TaskChecklistItem` (QA gate) + `QaSignoff`,
  `Document` (naming standard), `Clash`, `Rfi`, `TimesheetEntry`
- **Finance:** `Invoice` + `InvoiceLineItem`, `Expense`
- **Client collaboration:** `ClientMessage`, `StatusReport`, `Approval`

The seed (`prisma/seed.mjs`) loads: 7 divisions, 8 team members, 5 international clients,
6 projects (mixed R/A/G health), ~24 tasks with QA checklists, 4 SOPs, ~29 documents
(incl. intentionally non-compliant ones), clashes, RFIs, ~100 timesheet entries,
10 CRM leads across the pipeline, 14 days of outreach records, invoices, expenses,
client messages, status reports and approvals — so **no dashboard is ever empty**.

---

## 🛠️ Tech stack

- **Next.js 14** (App Router, React Server Components + Server Actions)
- **Tailwind CSS** — brand-appropriate design system (engineering navy + precision teal)
- **shadcn/ui-style** hand-built UI primitives (`src/components/ui.jsx`) — zero extra install friction
- **Prisma ORM** with **SQLite** — single local file, no DB server
- **@dnd-kit** — drag-and-drop for the CRM pipeline and the task board
- **lucide-react** icons, pure-SVG charts (no heavy charting dependency)

## 📁 Project structure

```
datumos/
├─ prisma/
│  ├─ schema.prisma        # full data model
│  ├─ seed.mjs             # dummy data
│  └─ dev.db               # local SQLite database (created on migrate)
├─ src/
│  ├─ app/
│  │  ├─ page.js           # portal selector (home)
│  │  ├─ director/         # Portal 1 — Director's Command Center
│  │  ├─ workspace/        # Portal 2 — Internal Workspace
│  │  └─ client/           # Portal 3 — Client Portal
│  ├─ components/          # PortalShell, UI primitives, charts, logo
│  └─ lib/                 # prisma client, queries, formatting helpers
├─ .env                    # DATABASE_URL="file:./dev.db"
└─ package.json
```

## 📜 npm scripts

| Script | Does |
|---|---|
| `npm run dev` | start dev server on :3000 |
| `npm run build` | production build (`prisma generate` + `next build`) |
| `npm start` | run the production build |
| `npm run db:seed` | (re)load dummy data |
| `npm run setup` | generate + migrate + seed in one command |

---

## 🚀 Deploying to a permanent host (Vercel + Postgres)

The local app uses **SQLite**, which is perfect for a zero-setup local MVP but does **not** persist on
serverless hosts (Vercel/Netlify/etc. have no durable local disk). To put DatumOS on a **permanent public
URL**, switch the database layer to a managed **Postgres** (Neon or Supabase — both have free tiers). The
app code and the seed data are database-agnostic, so **only the schema provider and the connection string
change**.

**1. Provision Postgres** — create a database on [Neon](https://neon.tech) or
[Supabase](https://supabase.com) and copy its connection string.

**2. Switch the schema to Postgres** (a ready-made variant is included):
```bash
cp prisma/schema.postgres.prisma prisma/schema.prisma
```
> `schema.postgres.prisma` is byte-for-byte identical to the SQLite schema except
> `provider = "postgresql"`.

**3. Point the app at Postgres** — set `DATABASE_URL` (locally in `.env`, and in your host's env vars).
See [`.env.production.example`](.env.production.example) for Neon/Supabase URL formats:
```bash
DATABASE_URL="postgresql://user:password@host:5432/datumos?sslmode=require"
```

**4. Create the tables and load the demo data:**
```bash
npx prisma migrate deploy   # or: npx prisma db push
npm run db:seed             # same rich demo data as local
```

**5. Deploy to Vercel:**
```bash
npm i -g vercel
vercel            # first deploy (set DATABASE_URL when prompted / in project settings)
vercel --prod     # promote to the production URL
```
Vercel runs `npm run build` (which includes `prisma generate`) automatically. Add `DATABASE_URL`
under **Project → Settings → Environment Variables** before the first production build.

> Any Node host works the same way (Railway, Render, Fly.io): set `DATABASE_URL`, run
> `prisma migrate deploy && npm run db:seed`, then `npm run build && npm start`.

**Quick public demo without changing the DB** — expose the local SQLite app through a tunnel
(what the live URL above uses):
```bash
npm run dev                              # serve locally on :3000
npx cloudflared tunnel --url http://localhost:3000 --protocol http2
```
This is great for demos, but the tunnel URL only lives as long as the process; use the Vercel + Postgres
path for anything permanent.

---

## ❓ Troubleshooting

- **"Table does not exist" / empty pages:** run `npx prisma migrate dev` then `npm run db:seed`.
- **Port 3000 in use:** run `npm run dev -- -p 3001` and open http://localhost:3001.
- **Reset everything:** delete `prisma/dev.db`, then `npx prisma migrate dev` + `npm run db:seed`.

---

_DatumOS · Local MVP · © Datum Studios Engineering Consultancy._