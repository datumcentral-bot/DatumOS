"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function log(actor, action, entity, entityId, summary, portal = "director") {
  try {
    await prisma.activityLog.create({ data: { actor, action, entity, entityId, summary, portal } });
  } catch {}
}

const str = (fd, k) => (fd.get(k) || "").toString().trim();

export async function createMeeting(fd) {
  const title = str(fd, "title");
  if (!title) return { ok: false, message: "Title required." };
  const projectId = str(fd, "projectId") || null;
  const m = await prisma.meeting.create({
    data: {
      title,
      projectId,
      agenda: str(fd, "agenda") || null,
      attendees: str(fd, "attendees") || null,
      status: str(fd, "status") || "SCHEDULED",
      scheduledAt: fd.get("scheduledAt") ? new Date(fd.get("scheduledAt").toString()) : new Date(),
    },
  });
  await log("Bilal Ahmed", "CREATED", "Meeting", m.id, `scheduled meeting "${title}"`);
  revalidatePath("/director/meetings");
  return { ok: true, id: m.id };
}

export async function setMeetingStatus(id, status) {
  await prisma.meeting.update({ where: { id }, data: { status } });
  await log("Bilal Ahmed", status === "LIVE" ? "CREATED" : "UPDATED", "Meeting", id, `set meeting ${status.toLowerCase()}`);
  revalidatePath("/director/meetings");
  return { ok: true };
}

// Persist a recording marker (duration in seconds). The actual media blob is
// downloaded client-side via MediaRecorder; we store that a recording exists.
export async function saveRecording(id, seconds) {
  await prisma.meeting.update({ where: { id }, data: { recordingUrl: "captured-locally", recordingSecs: Math.round(seconds) } });
  await log("Bilal Ahmed", "UPDATED", "Meeting", id, `recorded ${Math.round(seconds)}s of a meeting`);
  revalidatePath("/director/meetings");
  return { ok: true };
}

export async function addMeetingNote(fd) {
  const meetingId = str(fd, "meetingId");
  const body = str(fd, "body");
  if (!meetingId || !body) return { ok: false, message: "Note text required." };
  const kind = str(fd, "kind") || "NOTE";
  await prisma.meetingNote.create({ data: { meetingId, body, kind } });
  await log("Bilal Ahmed", "CREATED", "MeetingNote", meetingId, `logged a ${kind.toLowerCase()} in a meeting`);
  revalidatePath("/director/meetings");
  return { ok: true };
}

// Turn a meeting action-item into a real Task on a project (drive Kanban from a meeting).
export async function noteToTask(noteId, projectId) {
  const note = await prisma.meetingNote.findUnique({ where: { id: noteId }, include: { meeting: true } });
  if (!note) return { ok: false, message: "Note not found." };
  const pid = projectId || note.meeting.projectId;
  if (!pid) return { ok: false, message: "No project linked — pick one." };
  const task = await prisma.task.create({
    data: {
      projectId: pid,
      title: note.body.slice(0, 120),
      description: `Action item from meeting: ${note.meeting.title}`,
      status: "TODO",
      priority: "HIGH",
      cdeState: "S0",
      qaRequired: true,
    },
  });
  const items = ["Work completed to brief", "Self-check performed", "Naming standard applied", "Ready for QA review"];
  let ci = 0;
  for (const label of items) await prisma.taskChecklistItem.create({ data: { taskId: task.id, label, orderIndex: ci++ } });
  await prisma.meetingNote.update({ where: { id: noteId }, data: { linkedTaskId: task.id, kind: "ACTION" } });
  await log("Bilal Ahmed", "CREATED", "Task", task.id, `created task from meeting action item`, "workspace");
  revalidatePath("/director/meetings");
  revalidatePath("/workspace");
  return { ok: true, taskId: task.id };
}
