import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH /api/tasks/[id] — update task status, priority, assignee, etc.
export async function PATCH(req, { params }) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  const { id } = params;
  const body = await req.json();

  try {
    const updateData = {};
    if (body.status !== undefined)      updateData.status = body.status;
    if (body.priority !== undefined)    updateData.priority = body.priority;
    if (body.assigneeId !== undefined)  updateData.assigneeId = body.assigneeId;
    if (body.title !== undefined)       updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dueDate !== undefined)     updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.cdeState !== undefined)    updateData.cdeState = body.cdeState;
    if (body.actualHrs !== undefined)   updateData.actualHrs = parseFloat(body.actualHrs);

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, code: true, name: true } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        actor: session.user.name || session.user.email,
        action: "UPDATE",
        entity: "Task",
        entityId: id,
        summary: `Task "${task.title}" updated${body.status ? ` → ${body.status}` : ""}`,
        portal: "workspace",
      },
    }).catch(() => {}); // non-blocking

    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(req, { params }) {
  try {
    await requireAuth();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  const { id } = params;
  try {
    await prisma.taskChecklistItem.deleteMany({ where: { taskId: id } });
    await prisma.qaSignoff.deleteMany({ where: { taskId: id } });
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
