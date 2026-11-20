"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Toggle a single checklist item on a task
export async function toggleChecklistItem(itemId, checked, code) {
  await prisma.taskChecklistItem.update({
    where: { id: itemId },
    data: { checked },
  });
  revalidatePath(`/workspace/${code}`);
}

// Move a task status forward. Enforces the QA gate:
// a task can only become DONE when ALL checklist items are checked.
export async function advanceTaskStatus(taskId, code) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { checklist: true },
  });
  if (!task) return { ok: false, message: "Task not found" };

  const order = ["TODO", "IN_PROGRESS", "QA_REVIEW", "DONE"];
  const idx = order.indexOf(task.status);
  const next = order[Math.min(order.length - 1, idx + 1)];

  // QA GATE: cannot mark DONE unless every checklist item is complete
  if (next === "DONE") {
    const incomplete = task.checklist.filter((c) => !c.checked).length;
    if (incomplete > 0) {
      return { ok: false, message: `QA gate: ${incomplete} checklist item(s) still open. Complete the mandatory QA/QC checklist before closing.` };
    }
    // record a QA sign-off
    const reviewer = await prisma.user.findFirst({ where: { role: "QA_QC" } });
    if (reviewer) {
      await prisma.qaSignoff.create({
        data: { taskId: task.id, reviewerId: reviewer.id, result: "PASS", comment: "Checklist verified complete via workspace QA gate." },
      });
    }
  }

  await prisma.task.update({ where: { id: taskId }, data: { status: next } });
  revalidatePath(`/workspace/${code}`);
  return { ok: true };
}

export async function setTaskStatus(taskId, status, code) {
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath(`/workspace/${code}`);
}

// Drag-and-drop: move a task to an explicit target status column.
// Enforces the SAME mandatory QA gate as advanceTaskStatus:
// a task can only enter DONE when EVERY checklist item is checked.
export async function moveTaskToStatus(taskId, targetStatus, code) {
  const allowed = ["TODO", "IN_PROGRESS", "QA_REVIEW", "DONE"];
  if (!allowed.includes(targetStatus)) return { ok: false, message: "Unknown status" };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { checklist: true },
  });
  if (!task) return { ok: false, message: "Task not found" };
  if (task.status === targetStatus) return { ok: true };

  // QA GATE: cannot drop into DONE unless every checklist item is complete.
  if (targetStatus === "DONE") {
    const incomplete = task.checklist.filter((c) => !c.checked).length;
    if (incomplete > 0) {
      return {
        ok: false,
        message: `QA gate: ${incomplete} checklist item(s) still open. Open the task and complete the mandatory QA/QC checklist before moving it to Done.`,
      };
    }
    // record a QA sign-off
    const reviewer = await prisma.user.findFirst({ where: { role: "QA_QC" } });
    if (reviewer) {
      await prisma.qaSignoff.create({
        data: {
          taskId: task.id,
          reviewerId: reviewer.id,
          result: "PASS",
          comment: "Checklist verified complete via workspace drag-and-drop QA gate.",
        },
      });
    }
  }

  await prisma.task.update({ where: { id: taskId }, data: { status: targetStatus } });
  revalidatePath(`/workspace/${code}`);
  return { ok: true };
}
