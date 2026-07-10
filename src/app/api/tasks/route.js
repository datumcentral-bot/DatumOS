/**
 * GET /api/tasks — returns tasks scoped to the session user's role.
 * DIRECTOR: all tasks
 * MEMBER: only tasks assigned to their linked User.id
 * CLIENT: only tasks on projects belonging to their linked Client.id
 *
 * POST /api/tasks — create a task (DIRECTOR only)
 * PATCH /api/tasks — update task status/checklist (DIRECTOR or MEMBER)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, taskScopeWhere, ROLES } from "@/lib/auth";

export async function GET() {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  const where = taskScopeWhere(session);
  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true, role: true } },
      project: { select: { id: true, code: true, name: true } },
      checklist: { orderBy: { orderIndex: "asc" } },
      qaSignoffs: { orderBy: { signedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, tasks });
}

export async function POST(req) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  if (session.user.role !== ROLES.DIRECTOR) {
    return NextResponse.json({ error: "Only Directors can create tasks" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { projectId, title, description, assigneeId, priority, dueDate, divisionCode, sopId, scopeId } = body;

  if (!projectId || !title) {
    return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description: description || null,
      assigneeId: assigneeId || null,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      divisionCode: divisionCode || null,
      sopId: sopId || null,
      scopeId: scopeId || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      actor: session.user.name,
      action: "CREATED",
      entity: "Task",
      entityId: task.id,
      summary: `Created task '${title}'`,
      portal: "director",
    },
  });

  return NextResponse.json({ ok: true, task });
}

export async function PATCH(req) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { taskId, status, checklistItemId, checked } = body;

  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  // Verify the user can access this task
  const scopeWhere = taskScopeWhere(session);
  const task = await prisma.task.findFirst({ where: { id: taskId, ...scopeWhere } });
  if (!task) return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });

  // Update checklist item
  if (checklistItemId !== undefined) {
    await prisma.taskChecklistItem.update({
      where: { id: checklistItemId },
      data: { checked: !!checked },
    });
    return NextResponse.json({ ok: true });
  }

  // Update status — enforce QA gate
  if (status === "DONE") {
    const checklist = await prisma.taskChecklistItem.findMany({ where: { taskId } });
    const allChecked = checklist.length === 0 || checklist.every((c) => c.checked);
    if (!allChecked) {
      return NextResponse.json({
        ok: false,
        error: "QA gate: all checklist items must be checked before marking Done.",
      }, { status: 422 });
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      actor: session.user.name,
      action: "MOVED",
      entity: "Task",
      entityId: taskId,
      summary: `moved task '${task.title}' to ${status}`,
      portal: session.user.role === ROLES.DIRECTOR ? "director" : "workspace",
    },
  });

  return NextResponse.json({ ok: true, task: updated });
}
