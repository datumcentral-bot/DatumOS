"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================================================
// Director "full control" CRUD. Every mutation writes an ActivityLog row so the
// real-time feed updates across portals, and revalidates the affected paths.
// ============================================================================

async function log(actor, action, entity, entityId, summary, portal = "director") {
  try {
    await prisma.activityLog.create({ data: { actor, action, entity, entityId, summary, portal } });
  } catch {}
}

function revalAll() {
  revalidatePath("/director");
  revalidatePath("/director/clients");
  revalidatePath("/director/portfolio");
  revalidatePath("/director/team");
  revalidatePath("/director/admin");
  revalidatePath("/workspace");
  revalidatePath("/client");
}

const str = (fd, k) => (fd.get(k) || "").toString().trim();
const num = (fd, k) => Number(fd.get(k) || 0);

// ── CLIENTS ─────────────────────────────────────────────────────────────────
export async function createClient(fd) {
  const companyName = str(fd, "companyName");
  if (!companyName) return { ok: false, message: "Company name required." };
  const c = await prisma.client.create({
    data: {
      companyName,
      country: str(fd, "country") || "—",
      city: str(fd, "city") || null,
      contactName: str(fd, "contactName") || "—",
      contactEmail: str(fd, "contactEmail") || `contact@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
      contactPhone: str(fd, "contactPhone") || null,
      timezone: str(fd, "timezone") || null,
      logoHue: str(fd, "logoHue") || "#7c8340",
    },
  });
  await prisma.clientUser.create({ data: { name: c.contactName, email: c.contactEmail, clientId: c.id } });
  await log("Bilal Ahmed", "CREATED", "Client", c.id, `created client ${companyName}`);
  revalAll();
  return { ok: true, id: c.id };
}

export async function updateClient(fd) {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Missing id." };
  await prisma.client.update({
    where: { id },
    data: {
      companyName: str(fd, "companyName"),
      country: str(fd, "country"),
      city: str(fd, "city") || null,
      contactName: str(fd, "contactName"),
      contactEmail: str(fd, "contactEmail"),
      contactPhone: str(fd, "contactPhone") || null,
      timezone: str(fd, "timezone") || null,
    },
  });
  await log("Bilal Ahmed", "UPDATED", "Client", id, `updated client ${str(fd, "companyName")}`);
  revalAll();
  return { ok: true };
}

export async function deleteClient(id) {
  const projects = await prisma.project.count({ where: { clientId: id } });
  if (projects > 0) return { ok: false, message: "Client has projects — reassign or delete those first." };
  await prisma.clientUser.deleteMany({ where: { clientId: id } });
  await prisma.invoice.deleteMany({ where: { clientId: id } });
  await prisma.client.delete({ where: { id } });
  await log("Bilal Ahmed", "DELETED", "Client", id, `deleted a client`);
  revalAll();
  return { ok: true };
}

// ── PROJECTS ────────────────────────────────────────────────────────────────
export async function createProject(fd) {
  const name = str(fd, "name");
  const clientId = str(fd, "clientId");
  if (!name || !clientId) return { ok: false, message: "Name and client required." };
  let code = str(fd, "code");
  if (!code) {
    const count = await prisma.project.count();
    code = `DS-${String(2407 + count).padStart(4, "0")}`;
  }
  const dupe = await prisma.project.findUnique({ where: { code } });
  if (dupe) return { ok: false, message: `Project code ${code} already exists.` };

  const divs = fd.getAll("divisions").map((d) => d.toString());
  const project = await prisma.project.create({
    data: {
      code,
      name,
      clientId,
      status: str(fd, "status") || "ACTIVE",
      health: str(fd, "health") || "GREEN",
      healthNote: str(fd, "healthNote") || null,
      stage: str(fd, "stage") || "Design Development",
      progress: num(fd, "progress"),
      contractValue: num(fd, "contractValue"),
      estimatedHrs: num(fd, "estimatedHrs"),
      actualHrs: 0,
      description: str(fd, "description") || `${name} — delivered by Datum Studios.`,
      coverHue: str(fd, "coverHue") || "#3a3f28",
    },
  });

  // link divisions + create a scope package per division + default folders
  const allDivs = await prisma.division.findMany();
  const byCode = Object.fromEntries(allDivs.map((d) => [d.code, d]));
  let si = 0;
  for (const dc of divs) {
    if (!byCode[dc]) continue;
    await prisma.projectDivision.create({ data: { projectId: project.id, divisionId: byCode[dc].id, scopeNote: `${byCode[dc].name} scope` } });
    await prisma.scopeOfWork.create({
      data: { projectId: project.id, title: `${byCode[dc].name} Package`, divisionCode: dc, status: "PLANNED", budgetHrs: 120, orderIndex: si++ },
    });
  }
  const folders = ["00-Incoming", "01-WIP", "02-Shared", "03-Published", "04-Archive"];
  let fi = 0;
  for (const f of folders) await prisma.projectFolder.create({ data: { projectId: project.id, name: f, orderIndex: fi++ } });

  await log("Bilal Ahmed", "CREATED", "Project", project.id, `created project ${code} ${name}`);
  revalAll();
  return { ok: true, id: project.id, code };
}

export async function updateProject(fd) {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Missing id." };
  await prisma.project.update({
    where: { id },
    data: {
      name: str(fd, "name"),
      status: str(fd, "status"),
      health: str(fd, "health"),
      healthNote: str(fd, "healthNote") || null,
      stage: str(fd, "stage"),
      progress: num(fd, "progress"),
      contractValue: num(fd, "contractValue"),
      estimatedHrs: num(fd, "estimatedHrs"),
    },
  });
  await log("Bilal Ahmed", "UPDATED", "Project", id, `updated project ${str(fd, "name")}`);
  revalAll();
  return { ok: true };
}

export async function deleteProject(id) {
  // cascade-delete children (SQLite has no ON DELETE CASCADE here)
  await prisma.$transaction([
    prisma.approval.deleteMany({ where: { projectId: id } }),
    prisma.statusReport.deleteMany({ where: { projectId: id } }),
    prisma.clientMessage.deleteMany({ where: { projectId: id } }),
    prisma.timesheetEntry.deleteMany({ where: { projectId: id } }),
    prisma.rfi.deleteMany({ where: { projectId: id } }),
    prisma.clash.deleteMany({ where: { projectId: id } }),
    prisma.document.deleteMany({ where: { projectId: id } }),
    prisma.taskChecklistItem.deleteMany({ where: { task: { projectId: id } } }),
    prisma.qaSignoff.deleteMany({ where: { task: { projectId: id } } }),
    prisma.task.deleteMany({ where: { projectId: id } }),
    prisma.scopeOfWork.deleteMany({ where: { projectId: id } }),
    prisma.milestone.deleteMany({ where: { projectId: id } }),
    prisma.projectFolder.deleteMany({ where: { projectId: id } }),
    prisma.projectAssignment.deleteMany({ where: { projectId: id } }),
    prisma.projectDivision.deleteMany({ where: { projectId: id } }),
    prisma.meetingNote.deleteMany({ where: { meeting: { projectId: id } } }),
    prisma.meeting.deleteMany({ where: { projectId: id } }),
    prisma.invoiceLineItem.deleteMany({ where: { invoice: { projectId: id } } }),
    prisma.invoice.deleteMany({ where: { projectId: id } }),
    prisma.expense.deleteMany({ where: { projectId: id } }),
    prisma.project.delete({ where: { id } }),
  ]);
  await log("Bilal Ahmed", "DELETED", "Project", id, `deleted a project and all its records`);
  revalAll();
  return { ok: true };
}

// ── SCOPE OF WORK ─────────────────────────────────────────────────────────────
export async function createScope(fd) {
  const projectId = str(fd, "projectId");
  const title = str(fd, "title");
  if (!projectId || !title) return { ok: false, message: "Project and title required." };
  const count = await prisma.scopeOfWork.count({ where: { projectId } });
  const s = await prisma.scopeOfWork.create({
    data: {
      projectId,
      title,
      divisionCode: str(fd, "divisionCode") || null,
      description: str(fd, "description") || null,
      status: str(fd, "status") || "PLANNED",
      budgetHrs: num(fd, "budgetHrs"),
      orderIndex: count,
    },
  });
  await log("Bilal Ahmed", "CREATED", "Scope", s.id, `added scope "${title}"`);
  revalAll();
  return { ok: true, id: s.id };
}

export async function updateScopeStatus(id, status) {
  await prisma.scopeOfWork.update({ where: { id }, data: { status } });
  await log("Bilal Ahmed", "UPDATED", "Scope", id, `moved scope to ${status}`);
  revalAll();
  return { ok: true };
}

export async function deleteScope(id) {
  await prisma.task.updateMany({ where: { scopeId: id }, data: { scopeId: null } });
  await prisma.scopeOfWork.delete({ where: { id } });
  await log("Bilal Ahmed", "DELETED", "Scope", id, `removed a scope package`);
  revalAll();
  return { ok: true };
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
export async function createTask(fd) {
  const projectId = str(fd, "projectId");
  const title = str(fd, "title");
  if (!projectId || !title) return { ok: false, message: "Project and title required." };
  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description: str(fd, "description") || null,
      divisionCode: str(fd, "divisionCode") || null,
      status: str(fd, "status") || "TODO",
      priority: str(fd, "priority") || "MEDIUM",
      assigneeId: str(fd, "assigneeId") || null,
      scopeId: str(fd, "scopeId") || null,
      estimatedHrs: num(fd, "estimatedHrs"),
      dueDate: fd.get("dueDate") ? new Date(fd.get("dueDate").toString()) : null,
      cdeState: "S0",
      qaRequired: true,
    },
  });
  // default QA checklist so the QA gate has something to enforce
  const items = ["Work completed to brief", "Self-check performed", "Naming standard applied", "Ready for QA review"];
  let ci = 0;
  for (const label of items) await prisma.taskChecklistItem.create({ data: { taskId: task.id, label, orderIndex: ci++ } });
  await log("Bilal Ahmed", "CREATED", "Task", task.id, `created task "${title}"`, "workspace");
  revalAll();
  return { ok: true, id: task.id };
}

export async function updateTask(fd) {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Missing id." };
  await prisma.task.update({
    where: { id },
    data: {
      title: str(fd, "title"),
      description: str(fd, "description") || null,
      priority: str(fd, "priority"),
      assigneeId: str(fd, "assigneeId") || null,
      estimatedHrs: num(fd, "estimatedHrs"),
      dueDate: fd.get("dueDate") ? new Date(fd.get("dueDate").toString()) : null,
    },
  });
  await log("Bilal Ahmed", "UPDATED", "Task", id, `updated task "${str(fd, "title")}"`, "workspace");
  revalAll();
  return { ok: true };
}

export async function deleteTask(id) {
  await prisma.taskChecklistItem.deleteMany({ where: { taskId: id } });
  await prisma.qaSignoff.deleteMany({ where: { taskId: id } });
  await prisma.task.delete({ where: { id } });
  await log("Bilal Ahmed", "DELETED", "Task", id, `deleted a task`, "workspace");
  revalAll();
  return { ok: true };
}

export async function assignTask(taskId, assigneeId) {
  await prisma.task.update({ where: { id: taskId }, data: { assigneeId: assigneeId || null } });
  await log("Bilal Ahmed", "UPDATED", "Task", taskId, `reassigned a task`, "workspace");
  revalAll();
  return { ok: true };
}

// ── ASSIGNMENTS (team ↔ project) ─────────────────────────────────────────────
export async function addAssignment(fd) {
  const projectId = str(fd, "projectId");
  const userId = str(fd, "userId");
  if (!projectId || !userId) return { ok: false, message: "Project and member required." };
  const existing = await prisma.projectAssignment.findUnique({ where: { projectId_userId: { projectId, userId } } }).catch(() => null);
  if (existing) {
    await prisma.projectAssignment.update({ where: { id: existing.id }, data: { roleOnProject: str(fd, "roleOnProject") || existing.roleOnProject, allocationPct: num(fd, "allocationPct") || existing.allocationPct } });
  } else {
    await prisma.projectAssignment.create({
      data: { projectId, userId, roleOnProject: str(fd, "roleOnProject") || "Team Member", allocationPct: num(fd, "allocationPct") || 50 },
    });
  }
  await log("Bilal Ahmed", "UPDATED", "Assignment", projectId, `assigned a team member to a project`);
  revalAll();
  return { ok: true };
}

export async function removeAssignment(id) {
  await prisma.projectAssignment.delete({ where: { id } });
  await log("Bilal Ahmed", "DELETED", "Assignment", id, `removed a project assignment`);
  revalAll();
  return { ok: true };
}

// ── TEAM MEMBERS ─────────────────────────────────────────────────────────────
export async function createMember(fd) {
  const name = str(fd, "name");
  const email = str(fd, "email");
  if (!name || !email) return { ok: false, message: "Name and email required." };
  const dupe = await prisma.user.findUnique({ where: { email } });
  if (dupe) return { ok: false, message: "A member with that email already exists." };
  const hues = ["#7c8340", "#5f6733", "#a67d3c", "#c19749", "#979d52", "#b3b877"];
  const u = await prisma.user.create({
    data: {
      name,
      email,
      role: str(fd, "role") || "MODELER",
      title: str(fd, "title") || null,
      division: str(fd, "division") || null,
      avatarHue: hues[Math.floor(Math.random() * hues.length)],
      capacityHrs: num(fd, "capacityHrs") || 40,
      active: true,
    },
  });
  await log("Bilal Ahmed", "CREATED", "Member", u.id, `added team member ${name}`);
  revalAll();
  return { ok: true, id: u.id };
}

export async function updateMember(fd) {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Missing id." };
  await prisma.user.update({
    where: { id },
    data: {
      name: str(fd, "name"),
      role: str(fd, "role"),
      title: str(fd, "title") || null,
      division: str(fd, "division") || null,
      capacityHrs: num(fd, "capacityHrs") || 40,
    },
  });
  await log("Bilal Ahmed", "UPDATED", "Member", id, `updated team member ${str(fd, "name")}`);
  revalAll();
  return { ok: true };
}

export async function setMemberActive(id, active) {
  await prisma.user.update({ where: { id }, data: { active } });
  await log("Bilal Ahmed", active ? "UPDATED" : "UPDATED", "Member", id, `${active ? "re-activated" : "deactivated"} a team member`);
  revalAll();
  return { ok: true };
}
