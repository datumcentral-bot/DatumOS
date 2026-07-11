import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// GET /api/admin/data?collection=<name>  — returns a specific collection
// GET /api/admin/data                    — returns ALL collections (AdminPanel)
export async function GET(req) {
  try {
    await requireRole("DIRECTOR");
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 403 });
  }

  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection");

  // Single-collection mode
  if (collection) {
    try {
      switch (collection) {
        // ── Core models ──────────────────────────────────────────────────────
        case "users":
          return NextResponse.json(await prisma.user.findMany({ orderBy: { name: "asc" } }));
        case "clients":
          return NextResponse.json(await prisma.client.findMany({ orderBy: { companyName: "asc" } }));
        case "projects":
        case "project_portfolio":
          return NextResponse.json(await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
            include: { client: true, divisions: { include: { division: true } }, _count: { select: { tasks: true, documents: true } } },
          }));
        case "assignments":
          return NextResponse.json(await prisma.projectAssignment.findMany({ include: { user: true, project: true } }));
        case "subcontractors":
          return NextResponse.json(await prisma.subcontractor.findMany({ orderBy: { companyName: "asc" } }));
        case "leads":
        case "crm_pipeline":
          return NextResponse.json(await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 }));
        case "tasks":
        case "midp_tidp_logs":
          return NextResponse.json(await prisma.task.findMany({
            orderBy: { createdAt: "desc" }, take: 200,
            include: { assignee: true, project: { select: { id: true, code: true, name: true } } },
          }));
        case "billing_and_invoices":
        case "financial_control":
          return NextResponse.json(await prisma.invoice.findMany({
            orderBy: { issueDate: "desc" }, take: 100,
            include: { client: true, project: true, lineItems: true },
          }));
        case "document_approvals":
        case "bim_verify":
          return NextResponse.json(await prisma.approval.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { project: { select: { id: true, code: true, name: true } }, document: true },
          }));
        case "document_vault":
        case "file_manager":
          return NextResponse.json(await prisma.document.findMany({
            orderBy: { createdAt: "desc" }, take: 200,
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "bim_coordination":
        case "coordination_hub":
          return NextResponse.json(await prisma.clashDetection.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "invoices":
      case "billing_and_invoices": {
        const inv = await prisma.invoice.create({ data: { invoiceNo: body.invoiceNo || `INV-${Date.now()}`, projectId: body.projectId, clientId: body.clientId, amount: parseFloat(body.amount) || 0, currency: body.currency || "AED", status: body.status || "DRAFT", issueDate: body.issueDate ? new Date(body.issueDate) : new Date(), dueDate: body.dueDate ? new Date(body.dueDate) : null, description: body.description } });
        return NextResponse.json(inv, { status: 201 });
      }
      case "approvals":
      case "document_approvals": {
        const appr = await prisma.approval.create({ data: { documentId: body.documentId, projectId: body.projectId, status: body.status || "PENDING", approverName: body.approverName, comment: body.comment, reviewedAt: body.reviewedAt ? new Date(body.reviewedAt) : null } });
        return NextResponse.json(appr, { status: 201 });
      }
      case "documents":
      case "document_vault": {
        const doc = await prisma.document.create({ data: { title: body.title, projectId: body.projectId, divisionCode: body.divisionCode, cdeState: body.cdeState || "S0", revision: body.revision || "A", fileType: body.fileType, fileUrl: body.fileUrl, notes: body.notes } });
        return NextResponse.json(doc, { status: 201 });
      }
      case "clashes":
      case "bim_coordination": {
        const clash = await prisma.clashDetection.create({ data: { projectId: body.projectId, title: body.title, disciplineA: body.disciplineA, disciplineB: body.disciplineB, status: body.status || "OPEN", severity: body.severity || "MEDIUM", location: body.location, assignedTo: body.assignedTo, resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : null } });
        return NextResponse.json(clash, { status: 201 });
      }
        case "financial_control":
          return NextResponse.json(await prisma.invoice.findMany({
            orderBy: { issueDate: "desc" }, take: 100,
            include: { client: true, project: true, lineItems: true },
          }));
        case "activity":
        case "activity_log":
          return NextResponse.json(await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }));
        case "risks":
        case "risk_register":
          return NextResponse.json(await prisma.risk.findMany({
            orderBy: { createdAt: "desc" },
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "lessons":
        case "lessons_learned":
          return NextResponse.json(await prisma.lesson.findMany({
            orderBy: { createdAt: "desc" },
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "raci":
        case "raci_matrix":
          return NextResponse.json(await prisma.raciEntry.findMany({ orderBy: { orderIndex: "asc" } }));
        case "meetings":
        case "bim_meetings":
          return NextResponse.json(await prisma.meeting.findMany({
            orderBy: { scheduledAt: "desc" }, take: 50,
            include: { project: { select: { id: true, code: true, name: true } }, notes: true },
          }));
        case "milestones":
        case "midp_logs":
          return NextResponse.json(await prisma.milestone.findMany({
            orderBy: { dueDate: "asc" },
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "scope":
        case "bim_scope_matrix":
          return NextResponse.json(await prisma.scopeOfWork.findMany({
            orderBy: { orderIndex: "asc" },
            include: { project: { select: { id: true, code: true, name: true } }, _count: { select: { tasks: true } } },
          }));
        case "documents":
        case "file_manager":
          return NextResponse.json(await prisma.document.findMany({
            orderBy: { createdAt: "desc" }, take: 200,
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "rfis":
        case "coordination_hub":
          return NextResponse.json(await prisma.rfi.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "clashes":
          return NextResponse.json(await prisma.clashDetection.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "timesheets":
          return NextResponse.json(await prisma.timesheetEntry.findMany({
            orderBy: { date: "desc" }, take: 200,
            include: { user: true, project: { select: { id: true, code: true, name: true } } },
          }));
        case "sops":
        case "sop_how-to":
          return NextResponse.json(await prisma.sop.findMany({ orderBy: { code: "asc" }, include: { checklist: true } }));
        case "kpi":
        case "kpi_and_evm":
          return NextResponse.json(await prisma.kpiMetric.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "resources":
        case "mobilization":
          return NextResponse.json(await prisma.resourceAllocation.findMany({
            orderBy: { weekStart: "desc" }, take: 200,
            include: { user: true, project: { select: { id: true, code: true, name: true } } },
          }));
        case "messages":
        case "tactical_chat":
          return NextResponse.json(await prisma.internalMessage.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { author: { select: { id: true, name: true, role: true } }, project: { select: { id: true, code: true, name: true } } },
          }));
        case "prequal":
        case "external_stakeholders":
          return NextResponse.json(await prisma.prequalSubmission.findMany({ orderBy: { createdAt: "desc" } }));
        case "approvals":
        case "bim_verify":
          return NextResponse.json(await prisma.approval.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { project: { select: { id: true, code: true, name: true } }, document: true },
          }));
        case "gantt":
        case "delivery_schedule":
          return NextResponse.json(await prisma.ganttTask.findMany({
            orderBy: [{ projectId: "asc" }, { orderIndex: "asc" }],
            include: { project: { select: { id: true, code: true, name: true } } },
          }));
        case "screen_share":
          return NextResponse.json(await prisma.screenShareSession.findMany({ orderBy: { startedAt: "desc" }, take: 20 }));
        case "workspace_dashboard":
          return NextResponse.json(await prisma.task.findMany({
            orderBy: { createdAt: "desc" }, take: 100,
            include: { assignee: true, project: { select: { id: true, code: true, name: true } } },
          }));
        case "client_dashboard":
          return NextResponse.json(await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
            include: { client: true, milestones: { orderBy: { orderIndex: "asc" } }, _count: { select: { tasks: true, documents: true } } },
          }));
        case "org_chart":
        case "enterprise_org_chart":
          return NextResponse.json(await prisma.user.findMany({
            orderBy: { name: "asc" },
            include: { assignments: { include: { project: { select: { id: true, code: true, name: true } } } } },
          }));
        case "project_team":
          return NextResponse.json(await prisma.user.findMany({
            orderBy: { name: "asc" },
            include: { assignments: { include: { project: { select: { id: true, code: true, name: true } } } } },
          }));
        case "monitoring":
        case "production_monitor":
          return NextResponse.json({
            tasks: await prisma.task.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { assignee: true, project: { select: { id: true, code: true, name: true } } } }),
            projects: await prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { client: true } }),
            activity: await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
          });
        case "admin_panel":
          return NextResponse.json({
            leads: await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
            clients: await prisma.client.findMany({ orderBy: { companyName: "asc" } }),
            projects: await prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { client: true } }),
            users: await prisma.user.findMany({ orderBy: { name: "asc" } }),
            risks: await prisma.risk.findMany({ orderBy: { createdAt: "desc" } }),
            invoices: await prisma.invoice.findMany({ orderBy: { issueDate: "desc" }, take: 50, include: { client: true, project: true } }),
          });
        default:
          return NextResponse.json({ error: `Unknown collection: ${collection}` }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // Full-dump mode (AdminPanel)
  try {
    const [
      leads, quoteRequests, newsletter, clients, projects, members,
      divisions, tasks, clashes, rfis, invoices, activityLog,
      subcontractors, risks, lessons, raci, meetings, milestones,
    ] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.client.findMany({ orderBy: { companyName: "asc" } }),
      prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { client: true } }),
      prisma.user.findMany({ orderBy: { name: "asc" } }),
      prisma.division.findMany({ orderBy: { code: "asc" } }),
      prisma.task.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { assignee: true, project: { select: { id: true, code: true, name: true } } } }),
      prisma.clashDetection.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { project: { select: { id: true, code: true, name: true } } } }),
      prisma.rfi.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { project: { select: { id: true, code: true, name: true } } } }),
      prisma.invoice.findMany({ orderBy: { issueDate: "desc" }, take: 50, include: { client: true, project: true } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.subcontractor.findMany({ orderBy: { companyName: "asc" } }),
      prisma.risk.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.lesson.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.raciEntry.findMany({ orderBy: { orderIndex: "asc" } }),
      prisma.meeting.findMany({ orderBy: { scheduledAt: "desc" }, take: 20, include: { notes: true } }),
      prisma.milestone.findMany({ orderBy: { dueDate: "asc" }, include: { project: { select: { id: true, code: true, name: true } } } }),
    ]);

    return NextResponse.json({
      leads, quoteRequests, newsletter, clients, projects, members,
      divisions, tasks, clashes, rfis, invoices, activityLog,
      subcontractors, risks, lessons, raci, meetings, milestones,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin/data — create a new record in a collection
export async function POST(req) {
  try {
    await requireRole("DIRECTOR");
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 403 });
  }

  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection");
  const body = await req.json();

  try {
    switch (collection) {
      case "risks":
      case "risk_register": {
        const risk = await prisma.risk.create({ data: { title: body.title, category: body.category || "TECHNICAL", probability: body.probability || "MEDIUM", impact: body.impact || "MEDIUM", status: body.status || "OPEN", owner: body.owner, mitigation: body.mitigation, contingency: body.contingency, projectId: body.projectId || null } });
        return NextResponse.json(risk, { status: 201 });
      }
      case "lessons":
      case "lessons_learned": {
        const lesson = await prisma.lesson.create({ data: { title: body.title, category: body.category || "PROCESS", impact: body.impact || "MEDIUM", action: body.action, status: body.status || "OPEN" } });
        return NextResponse.json(lesson, { status: 201 });
      }
      case "raci":
      case "raci_matrix": {
        const raci = await prisma.raciEntry.create({ data: { task: body.task || body.deliverable, person: body.person || "TBD", role: body.role || "R", projectId: body.projectId || null, notes: body.notes || body.phase || "" } });
        return NextResponse.json(raci, { status: 201 });
      }
      case "meetings":
      case "bim_meetings": {
        const meeting = await prisma.meeting.create({ data: { title: body.title, projectId: body.projectId || null, scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(), status: body.status || "SCHEDULED", agenda: body.agenda, attendees: body.attendees } });
        return NextResponse.json(meeting, { status: 201 });
      }
      case "leads":
      case "crm_pipeline": {
        const lead = await prisma.lead.create({ data: { company: body.company, contactName: body.contactName, contactEmail: body.contactEmail, country: body.country, source: body.source, serviceInterest: body.serviceInterest, estValue: parseFloat(body.estValue) || 0, stage: body.stage || "TO_CONTACT", probability: parseInt(body.probability) || 10, ownerName: body.ownerName, notes: body.notes } });
        return NextResponse.json(lead, { status: 201 });
      }
      case "subcontractors": {
        const sub = await prisma.subcontractor.create({ data: { companyName: body.companyName, contactName: body.contactName, contactEmail: body.contactEmail, contactPhone: body.contactPhone, specialty: body.specialty, country: body.country } });
        return NextResponse.json(sub, { status: 201 });
      }
      case "prequal":
      case "external_stakeholders": {
        const prequal = await prisma.prequalSubmission.create({ data: { company: body.company, country: body.country, contactName: body.contactName, contactEmail: body.contactEmail, services: body.services, experience: body.experience, certifications: body.certifications, status: body.status || "PENDING", notes: body.notes } });
        return NextResponse.json(prequal, { status: 201 });
      }
      case "scope":
      case "bim_scope_matrix": {
        const scope = await prisma.scopeOfWork.create({ data: { title: body.title, projectId: body.projectId, divisionCode: body.divisionCode, description: body.description, status: body.status || "PLANNED", budgetHrs: parseFloat(body.budgetHrs) || 0, orderIndex: body.orderIndex || 0 } });
        return NextResponse.json(scope, { status: 201 });
      }
      case "milestones": {
        const milestone = await prisma.milestone.create({ data: { title: body.title, projectId: body.projectId, dueDate: body.dueDate ? new Date(body.dueDate) : null, status: body.status || "PENDING", orderIndex: body.orderIndex || 0 } });
        return NextResponse.json(milestone, { status: 201 });
      }
      case "messages":
      case "tactical_chat": {
        // Find first user to use as author
        const firstUser = await prisma.user.findFirst();
        if (!firstUser) return NextResponse.json({ error: "No users found" }, { status: 400 });
        const msg = await prisma.internalMessage.create({ data: { body: body.body, channel: body.channel || "general", projectId: body.projectId || null, authorId: body.authorId || firstUser.id } });
        return NextResponse.json(msg, { status: 201 });
      }
      default:
        return NextResponse.json({ error: `POST not supported for collection: ${collection}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/data?collection=<name>&id=<id> — update a record
export async function PUT(req) {
  try {
    await requireRole("DIRECTOR");
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 403 });
  }

  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  try {
    switch (collection) {
      case "risks":
      case "risk_register": {
        const risk = await prisma.risk.update({ where: { id }, data: { title: body.title, category: body.category, probability: body.probability, impact: body.impact, status: body.status, owner: body.owner, mitigation: body.mitigation, contingency: body.contingency } });
        return NextResponse.json(risk);
      }
      case "leads":
      case "crm_pipeline": {
        const lead = await prisma.lead.update({ where: { id }, data: { stage: body.stage, probability: body.probability !== undefined ? parseInt(body.probability) : undefined, notes: body.notes, estValue: body.estValue !== undefined ? parseFloat(body.estValue) : undefined, orderIndex: body.orderIndex } });
        return NextResponse.json(lead);
      }
      case "meetings":
      case "bim_meetings": {
        const meeting = await prisma.meeting.update({ where: { id }, data: { title: body.title, status: body.status, agenda: body.agenda, attendees: body.attendees, scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined } });
        return NextResponse.json(meeting);
      }
      case "milestones": {
        const milestone = await prisma.milestone.update({ where: { id }, data: { title: body.title, status: body.status, dueDate: body.dueDate ? new Date(body.dueDate) : undefined } });
        return NextResponse.json(milestone);
      }
      case "prequal":
      case "external_stakeholders": {
        const prequal = await prisma.prequalSubmission.update({ where: { id }, data: { status: body.status, notes: body.notes } });
        return NextResponse.json(prequal);
      }
      case "scope":
      case "bim_scope_matrix": {
        const scope = await prisma.scopeOfWork.update({ where: { id }, data: { title: body.title, status: body.status, budgetHrs: body.budgetHrs !== undefined ? parseFloat(body.budgetHrs) : undefined, description: body.description } });
        return NextResponse.json(scope);
      }
      case "invoices":
      case "billing_and_invoices": {
        const inv = await prisma.invoice.update({ where: { id }, data: { status: body.status, amount: body.amount !== undefined ? parseFloat(body.amount) : undefined, dueDate: body.dueDate ? new Date(body.dueDate) : undefined, description: body.description } });
        return NextResponse.json(inv);
      }
      case "approvals":
      case "document_approvals": {
        const appr = await prisma.approval.update({ where: { id }, data: { status: body.status, comment: body.comment, reviewedAt: body.reviewedAt ? new Date(body.reviewedAt) : undefined } });
        return NextResponse.json(appr);
      }
      case "documents":
      case "document_vault": {
        const doc = await prisma.document.update({ where: { id }, data: { title: body.title, divisionCode: body.divisionCode, cdeState: body.cdeState, revision: body.revision, fileType: body.fileType, fileUrl: body.fileUrl, notes: body.notes } });
        return NextResponse.json(doc);
      }
      case "clashes":
      case "bim_coordination": {
        const clash = await prisma.clashDetection.update({ where: { id }, data: { status: body.status, severity: body.severity, location: body.location, assignedTo: body.assignedTo, resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : undefined } });
        return NextResponse.json(clash);
      }
      case "milestones": {
        const milestone = await prisma.milestone.update({ where: { id }, data: { title: body.title, status: body.status, dueDate: body.dueDate ? new Date(body.dueDate) : undefined } });
        return NextResponse.json(milestone);
      }
      default:
        return NextResponse.json({ error: `PUT not supported for collection: ${collection}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/data?collection=<name>&id=<id>
export async function DELETE(req) {
  try {
    await requireRole("DIRECTOR");
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 403 });
  }

  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection");
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    switch (collection) {
      case "risks":
      case "risk_register":
        await prisma.risk.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "leads":
      case "crm_pipeline":
        await prisma.lead.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "meetings":
      case "bim_meetings":
        await prisma.meetingNote.deleteMany({ where: { meetingId: id } });
        await prisma.meeting.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "milestones":
        await prisma.milestone.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "prequal":
      case "external_stakeholders":
        await prisma.prequalSubmission.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "subcontractors":
        await prisma.subcontractor.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "raci":
      case "raci_matrix":
        await prisma.raciEntry.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "lessons":
      case "lessons_learned":
        await prisma.lesson.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "invoices":
      case "billing_and_invoices":
        await prisma.invoice.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "approvals":
      case "document_approvals":
        await prisma.approval.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "documents":
      case "document_vault":
        await prisma.document.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "clashes":
      case "bim_coordination":
        await prisma.clashDetection.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "milestones":
        await prisma.milestone.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "sops":
      case "sop_how-to":
        await prisma.sop.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "gantt":
      case "delivery_schedule":
        await prisma.ganttTask.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "timesheets":
        await prisma.timesheetEntry.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "resources":
      case "mobilization":
        await prisma.resourceAllocation.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: `DELETE not supported for collection: ${collection}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}