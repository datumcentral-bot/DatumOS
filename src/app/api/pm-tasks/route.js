import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/broadcast";
import { requireRole, getMemberEntityId, projectScopeWhere, taskScopeWhere, ROLES } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) {
  let session;
  try {
    session = await requireRole(ROLES.DIRECTOR, ROLES.MEMBER);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    const { searchParams } = new URL(req.url);
    const where = { ...taskScopeWhere(session) };
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    if (projectId) where.projectId = projectId;
    if (session.user.role === ROLES.DIRECTOR && assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    const data = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { name: true, avatarHue: true } },
        project: { select: { name: true, code: true } },
        subtasks: { select: { id: true, title: true, status: true } },
        _count: { select: { comments: true, attachments: true, timeEntries: true, subtasks: true } },
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  let session;
  try {
    session = await requireRole(ROLES.DIRECTOR, ROLES.MEMBER);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    const body = await req.json();
    const { assignee, project, subtasks, comments, attachments, timeEntries, blockingDeps, blockedByDeps, _count, ...rest } = body;
    if (session.user.role === ROLES.MEMBER) {
      const memberId = getMemberEntityId(session);
      if (!memberId) return NextResponse.json({ error: "Member account is not linked to a team identity" }, { status: 403 });
      if (!rest.projectId || !(await prisma.project.findFirst({
        where: { AND: [{ id: rest.projectId }, projectScopeWhere(session)] },
        select: { id: true },
      }))) return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
      rest.assigneeId = memberId;
    }
    if (rest.projectId === "") rest.projectId = null;
    if (rest.assigneeId === "") rest.assigneeId = null;
    if (rest.parentId === "") rest.parentId = null;
    if (rest.estimatedHrs !== undefined) rest.estimatedHrs = Number(rest.estimatedHrs) || null;
    const data = await prisma.task.create({
      data: rest,
      include: { assignee: { select: { name: true } }, project: { select: { name: true } } },
    });
    broadcast("tasks", "created", data, session.user.name || "Director");
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function PUT(req) {
  let session;
  try {
    session = await requireRole(ROLES.DIRECTOR, ROLES.MEMBER);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    const body = await req.json();
    const { id, assignee, project, subtasks, comments, attachments, timeEntries, blockingDeps, blockedByDeps, _count, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const existing = await prisma.task.findFirst({
      where: { AND: [{ id }, taskScopeWhere(session)] },
      select: { id: true, projectId: true },
    });
    if (!existing) return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });

    if (session.user.role === ROLES.MEMBER) {
      const forbidden = Object.keys(rest).filter((key) => !["status", "actualHrs", "cdeState"].includes(key));
      if (forbidden.length) return NextResponse.json({ error: "Members may update only status, actualHrs, and cdeState on assigned tasks." }, { status: 403 });
      if (rest.actualHrs !== undefined) {
        rest.actualHrs = Number(rest.actualHrs);
        if (!Number.isFinite(rest.actualHrs) || rest.actualHrs < 0) return NextResponse.json({ error: "actualHrs must be non-negative" }, { status: 400 });
      }
    } else {
      if (rest.projectId && !(await prisma.project.findFirst({
        where: { AND: [{ id: rest.projectId }, projectScopeWhere(session)] },
        select: { id: true },
      }))) return NextResponse.json({ error: "Target project not found" }, { status: 404 });
      if (rest.projectId === "") rest.projectId = null;
      if (rest.assigneeId === "") rest.assigneeId = null;
      if (rest.estimatedHrs !== undefined) rest.estimatedHrs = Number(rest.estimatedHrs) || null;
    }
    const data = await prisma.task.update({
      where: { id },
      data: rest,
      include: { assignee: { select: { name: true } }, project: { select: { name: true } } },
    });
    broadcast("tasks", rest.status ? "updated" : "moved", data, session.user.name || "Director");
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function DELETE(req) {
  try {
    await requireRole(ROLES.DIRECTOR);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.task.delete({ where: { id } });
    broadcast("tasks", "deleted", { id }, "Director");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req);
  }
}
