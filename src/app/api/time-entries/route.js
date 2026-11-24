import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getMemberEntityId, projectScopeWhere, ROLES } from "@/lib/auth";
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
    const where = {};
    const taskId = searchParams.get("taskId");
    const userId = searchParams.get("userId");
    if (taskId) where.taskId = taskId;
    if (session.user.role === ROLES.MEMBER) {
      const memberId = getMemberEntityId(session);
      if (!memberId) return NextResponse.json([]);
      where.userId = memberId;
      where.task = { project: projectScopeWhere(session) };
    } else if (userId) {
      where.userId = userId;
    }
    const data = await prisma.timeEntry.findMany({
      where,
      include: { user: { select: { name: true } }, task: { select: { title: true } } },
      orderBy: { startedAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err, req);
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
    const memberId = session.user.role === ROLES.MEMBER ? getMemberEntityId(session) : null;
    if (session.user.role === ROLES.MEMBER && !memberId) return NextResponse.json({ error: "Member account is not linked to a team identity" }, { status: 403 });
    if (!body.taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    const task = await prisma.task.findFirst({
      where: session.user.role === ROLES.MEMBER
        ? { AND: [{ id: body.taskId }, { assigneeId: memberId }, { project: projectScopeWhere(session) }] }
        : { id: body.taskId },
      select: { id: true },
    });
    if (!task) return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    const data = await prisma.timeEntry.create({
      data: {
        ...body,
        userId: session.user.role === ROLES.MEMBER ? memberId : body.userId,
      },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return errorResponse(err, req);
  }
}
