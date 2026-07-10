import { prisma } from "./prisma";

// ============================================================================
// Shared data-access layer. All portals read live data from SQLite via these.
// ============================================================================

// --- DIRECTOR: executive KPIs ------------------------------------------------
export async function getExecutiveKpis() {
  const [projects, invoices, expenses, timesheets, users, wonLeads] = await Promise.all([
    prisma.project.findMany({ where: { status: "ACTIVE" } }),
    prisma.invoice.findMany(),
    prisma.expense.findMany(),
    prisma.timesheetEntry.findMany({ where: { date: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    prisma.user.findMany({ where: { active: true, role: { not: "DIRECTOR" } } }),
    prisma.lead.findMany({ where: { stage: "WON" } }),
  ]);

  // MRR: sum of active project contract value amortised over ~6 month avg engagement
  const activeContractTotal = projects.reduce((s, p) => s + p.contractValue, 0);
  const mrr = Math.round(activeContractTotal / 6);

  // Cash flow: paid invoices - expenses (last 90d)
  const paidIn = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0);
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const cashFlow = paidIn - spent;

  // Team utilisation: logged hours vs capacity over the period
  const totalCapacity = users.reduce((s, u) => s + u.capacityHrs * 4, 0); // ~4 weeks
  const loggedHrs = timesheets.reduce((s, t) => s + t.hours, 0);
  const utilization = totalCapacity ? Math.min(100, Math.round((loggedHrs / totalCapacity) * 100)) : 0;

  const wonValue = wonLeads.reduce((s, l) => s + l.estValue, 0);

  return {
    mrr,
    activeProjects: projects.length,
    cashFlow,
    paidIn,
    outstanding,
    spent,
    utilization,
    loggedHrs: Math.round(loggedHrs),
    totalCapacity: Math.round(totalCapacity),
    wonValue,
    activeContractTotal,
  };
}

// --- DIRECTOR: pipeline + outreach ------------------------------------------
export async function getPipeline() {
  const leads = await prisma.lead.findMany({ orderBy: { orderIndex: "asc" } });
  return leads;
}

export async function getOutreach() {
  const rows = await prisma.outreachActivity.findMany({
    orderBy: { date: "desc" },
    include: { user: true },
    take: 14,
  });
  return rows;
}

// --- Projects (portfolio / workspace) ---------------------------------------
export async function getProjects() {
  return prisma.project.findMany({
    include: {
      client: true,
      divisions: { include: { division: true } },
      assignments: { include: { user: true } },
      _count: { select: { tasks: true, clashes: true, rfis: true, documents: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProjectByCode(code) {
  return prisma.project.findUnique({
    where: { code },
    include: {
      client: true,
      divisions: { include: { division: true } },
      assignments: { include: { user: true } },
      milestones: { orderBy: { orderIndex: "asc" } },
      folders: { orderBy: { orderIndex: "asc" } },
      tasks: { include: { assignee: true, sop: true, checklist: true, qaSignoffs: { include: { reviewer: true } } }, orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      clashes: { orderBy: { createdAt: "desc" } },
      rfis: { include: { raisedBy: true }, orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      statusReports: { orderBy: { weekOf: "desc" } },
      approvals: { include: { document: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

// --- Finance -----------------------------------------------------------------
export async function getFinance() {
  const [invoices, expenses, projects] = await Promise.all([
    prisma.invoice.findMany({ include: { project: true, client: true, lineItems: true }, orderBy: { issueDate: "desc" } }),
    prisma.expense.findMany({ include: { project: true }, orderBy: { date: "desc" } }),
    prisma.project.findMany(),
  ]);
  return { invoices, expenses, projects };
}

// --- Team --------------------------------------------------------------------
export async function getTeam() {
  const users = await prisma.user.findMany({
    where: { active: true },
    include: {
      assignments: { include: { project: true } },
      tasks: true,
      timesheets: { where: { date: { gte: new Date(Date.now() - 14 * 86400000) } } },
      qaSignoffs: true,
    },
    orderBy: { name: "asc" },
  });
  return users;
}

export async function getQaSignoffs() {
  return prisma.qaSignoff.findMany({
    include: { reviewer: true, task: { include: { project: true } } },
    orderBy: { signedAt: "desc" },
    take: 20,
  });
}

// --- Documents ---------------------------------------------------------------
export async function getDocuments() {
  return prisma.document.findMany({ include: { project: true }, orderBy: { createdAt: "desc" } });
}

// --- Clash & RFI -------------------------------------------------------------
export async function getClashesAndRfis() {
  const [clashes, rfis] = await Promise.all([
    prisma.clash.findMany({ include: { project: true }, orderBy: { createdAt: "desc" } }),
    prisma.rfi.findMany({ include: { project: true, raisedBy: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return { clashes, rfis };
}

// --- Timesheets --------------------------------------------------------------
export async function getTimesheets() {
  return prisma.timesheetEntry.findMany({
    include: { user: true, project: true },
    orderBy: { date: "desc" },
    take: 60,
  });
}

// --- SOPs --------------------------------------------------------------------
export async function getSops() {
  return prisma.sop.findMany({ include: { checklist: { orderBy: { orderIndex: "asc" } }, _count: { select: { tasks: true } } } });
}

// --- Divisions ---------------------------------------------------------------
export async function getDivisions() {
  return prisma.division.findMany({ include: { _count: { select: { projectDivisions: true } } } });
}

// --- Client portal (scoped to a single signed-in client) --------------------
// For the local MVP we sign in a demo client (Meridian Architects).
export async function getPortalClient(companyName) {
  const client = companyName
    ? await prisma.client.findFirst({ where: { companyName } })
    : await prisma.client.findFirst({ orderBy: { companyName: "asc" } });
  if (!client) return null;
  return prisma.client.findUnique({
    where: { id: client.id },
    include: {
      projects: {
        include: {
          milestones: { orderBy: { orderIndex: "asc" } },
          documents: { where: { clientVisible: true }, orderBy: { createdAt: "desc" } },
          statusReports: { orderBy: { weekOf: "desc" } },
          messages: { orderBy: { createdAt: "asc" } },
          approvals: { include: { document: true }, orderBy: { createdAt: "desc" } },
          divisions: { include: { division: true } },
        },
      },
      invoices: { include: { project: true }, orderBy: { issueDate: "desc" } },
    },
  });
}

export async function getPortalProject(clientCompany, code) {
  const client = await getPortalClient(clientCompany);
  if (!client) return null;
  return client.projects.find((p) => p.code === code) || null;
}

// --- DIRECTOR ADMIN (full-control data bundle) ------------------------------
export async function getAdminData() {
  const [clients, projects, members, divisions] = await Promise.all([
    prisma.client.findMany({ include: { _count: { select: { projects: true } } }, orderBy: { companyName: "asc" } }),
    prisma.project.findMany({
      include: {
        client: true,
        divisions: { include: { division: true } },
        assignments: { include: { user: true } },
        scopes: { orderBy: { orderIndex: "asc" } },
        tasks: { include: { assignee: true, checklist: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({ include: { assignments: true, _count: { select: { tasks: true } } }, orderBy: { name: "asc" } }),
    prisma.division.findMany({ orderBy: { code: "asc" } }),
  ]);
  return { clients, projects, members, divisions };
}

export async function getActivity(take = 20) {
  return prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take });
}

// --- MEETINGS ---------------------------------------------------------------
export async function getMeetings() {
  return prisma.meeting.findMany({
    include: { project: true, notes: { orderBy: { createdAt: "asc" } } },
    orderBy: { scheduledAt: "desc" },
  });
}

// --- PUBLIC SITE -------------------------------------------------------------
export async function getPublicStats() {
  const [projects, clients, team, divisions, done] = await Promise.all([
    prisma.project.count(),
    prisma.client.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.division.count(),
    prisma.task.count({ where: { status: "DONE" } }),
  ]);
  const countries = await prisma.client.findMany({ select: { country: true } });
  const uniqueCountries = new Set(countries.map((c) => c.country)).size;
  return { projects, clients, team, divisions, done, countries: uniqueCountries };
}

export async function getFeaturedProjects(limit = 6) {
  return prisma.project.findMany({
    include: { client: true, divisions: { include: { division: true } } },
    orderBy: { progress: "desc" },
    take: limit,
  });
}

// --- Clients (directory) ----------------------------------------------------
export async function getClients() {
  return prisma.client.findMany({
    include: {
      projects: {
        include: {
          milestones: { orderBy: { orderIndex: "asc" } },
          _count: { select: { documents: true, tasks: true } },
        },
      },
      invoices: true,
    },
    orderBy: { companyName: "asc" },
  });
}
