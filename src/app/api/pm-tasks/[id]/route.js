import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, taskScopeWhere, projectScopeWhere, ROLES } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  let session;
  try {
    session = await requireRole(ROLES.DIRECTOR, ROLES.MEMBER);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    const data = await prisma.task.findFirst({
      where: { AND: [{ id: params.id }, taskScopeWhere(session)] },
      include: { project: { select: { name: true } }, assignee: { select: { name: true } } },
    });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function PUT(req, { params }) {
  let session;
  try {
    session = await requireRole(ROLES.DIRECTOR, ROLES.MEMBER);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    const existing = await prisma.task.findFirst({
      where: { AND: [{ id: params.id }, taskScopeWhere(session)] },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const raw = await req.json();
    const { id, project, assignee, subtasks, comments, attachments, timeEntries, ...body } = raw;
    const data = {};
    if (session.user.role === ROLES.MEMBER) {
      const allowed = ["status", "actualHrs", "cdeState"];
      const forbidden = Object.keys(body).filter((key) => !allowed.includes(key));
      if (forbidden.length) return NextResponse.json({ error: "Members may update only status, actualHrs, and cdeState on assigned tasks." }, { status: 403 });
      if (body.status !== undefined) data.status = body.status;
      if (body.cdeState !== undefined) data.cdeState = body.cdeState;
      if (body.actualHrs !== undefined) {
        data.actualHrs = Number(body.actualHrs);
        if (!Number.isFinite(data.actualHrs) || data.actualHrs < 0) return NextResponse.json({ error: "actualHrs must be non-negative" }, { status: 400 });
      }
    } else {
      Object.assign(data, body);
      if (data.dueDate) data.dueDate = new Date(data.dueDate);
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.projectId && !(await prisma.project.findFirst({
        where: { AND: [{ id: data.projectId }, projectScopeWhere(session)] },
        select: { id: true },
      }))) return NextResponse.json({ error: "Target project not found" }, { status: 404 });
    }
    const updated = await prisma.task.update({
      where: { id: params.id },
      data,
      include: { project: { select: { name: true } }, assignee: { select: { name: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireRole(ROLES.DIRECTOR);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req);
  }
}
