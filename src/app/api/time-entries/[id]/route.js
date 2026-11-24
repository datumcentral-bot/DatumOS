import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getMemberEntityId, ROLES } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  let session;
  try {
    session = await requireRole(ROLES.DIRECTOR, ROLES.MEMBER);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    const existing = await prisma.timeEntry.findFirst({
      where: session.user.role === ROLES.DIRECTOR
        ? { id: params.id }
        : { id: params.id, userId: getMemberEntityId(session) },
      select: { id: true, userId: true, taskId: true },
    });
    if (!existing) return NextResponse.json({ error: "Time entry not found or access denied" }, { status: 404 });
    const body = await req.json();
    const { id, userId, taskId, user, task, ...safeData } = body;
    if (session.user.role === ROLES.MEMBER && Object.keys(safeData).some((key) => !["startedAt", "endedAt", "duration", "notes", "description"].includes(key))) {
      return NextResponse.json({ error: "Members may edit only their own time entry details." }, { status: 403 });
    }
    const data = await prisma.timeEntry.update({
      where: { id: params.id },
      data: safeData,
    });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err, req);
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireRole(ROLES.DIRECTOR);
  } catch (err) {
    return errorResponse(err, req);
  }
  try {
    await prisma.timeEntry.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err, req);
  }
}
