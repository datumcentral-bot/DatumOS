import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, taskScopeWhere, ROLES } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// PATCH /api/tasks/[id] — Directors may edit task fields; Members may update
// only their assigned task's execution fields.
export async function PATCH(req, { params }) {
  let session;
  try {
    session = await requireRole(ROLES.DIRECTOR, ROLES.MEMBER);
  } catch (err) {
    return errorResponse(err, req);
  }

  try {
    const { id } = params;
    const scope = taskScopeWhere(session);
    const task = await prisma.task.findFirst({
      where: { AND: [{ id }, scope] },
      select: { id: true, title: true },
    });
    if (!task) return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });

    const body = await req.json();
    const updateData = {};

    if (session.user.role === ROLES.DIRECTOR) {
      if (body.status !== undefined) updateData.status = body.status;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId;
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      if (body.cdeState !== undefined) updateData.cdeState = body.cdeState;
      if (body.actualHrs !== undefined) updateData.actualHrs = Number(body.actualHrs);
    } else {
      const permitted = ["status", "actualHrs", "cdeState"];
      const forbidden = Object.keys(body).filter((key) => !permitted.includes(key));
      if (forbidden.length) {
        return NextResponse.json({ error: "Members may update only status, actualHrs, and cdeState on assigned tasks." }, { status: 403 });
      }
      if (body.status !== undefined) updateData.status = body.status;
      if (body.actualHrs !== undefined) updateData.actualHrs = Number(body.actualHrs);
      if (body.cdeState !== undefined) updateData.cdeState = body.cdeState;
    }

    if (updateData.actualHrs !== undefined && (!Number.isFinite(updateData.actualHrs) || updateData.actualHrs < 0)) {
      return NextResponse.json({ error: "actualHrs must be a non-negative number." }, { status: 400 });
    }

    if (updateData.status === "DONE") {
      const checklist = await prisma.taskChecklistItem.findMany({ where: { taskId: id } });
      if (checklist.some((item) => !item.checked)) {
        return NextResponse.json({
          ok: false,
          error: "QA gate: all checklist items must be checked before marking Done.",
        }, { status: 422 });
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, code: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        actor: session.user.name || session.user.email,
        action: "UPDATE",
        entity: "Task",
        entityId: id,
        summary: `Task "${updated.title}" updated${body.status ? ` → ${body.status}` : ""}`,
        portal: session.user.role === ROLES.DIRECTOR ? "director" : "workspace",
      },
    }).catch(() => {});

    return NextResponse.json(updated);
  } catch (e) {
    return errorResponse(e, req);
  }
}

// DELETE /api/tasks/[id] — destructive task deletion is Director-only.
export async function DELETE(req, { params }) {
  try {
    await requireRole(ROLES.DIRECTOR);
  } catch (err) {
    return errorResponse(err, req);
  }

  const { id } = params;
  try {
    await prisma.taskChecklistItem.deleteMany({ where: { taskId: id } });
    await prisma.qaSignoff.deleteMany({ where: { taskId: id } });
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req);
  }
}
