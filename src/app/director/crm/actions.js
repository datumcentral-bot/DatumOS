"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const STAGES = ["TO_CONTACT", "CONTACTED", "MEETING_BOOKED", "PROPOSAL_SENT", "WON"];
const PROB_MAP = { TO_CONTACT: 10, CONTACTED: 25, MEETING_BOOKED: 45, PROPOSAL_SENT: 70, WON: 100 };

// Drag-and-drop: move a lead directly to a target stage.
export async function setLeadStage(leadId, stage) {
  if (!STAGES.includes(stage)) return { ok: false, message: "Unknown stage" };
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { ok: false, message: "Lead not found" };
  if (lead.stage === stage) return { ok: true };
  await prisma.lead.update({
    where: { id: leadId },
    data: { stage, probability: PROB_MAP[stage] },
  });
  revalidatePath("/director/crm");
  revalidatePath("/director");
  return { ok: true };
}

export async function moveLead(leadId, direction) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;
  const idx = STAGES.indexOf(lead.stage);
  let next = idx;
  if (direction === "forward") next = Math.min(STAGES.length - 1, idx + 1);
  if (direction === "back") next = Math.max(0, idx - 1);
  const newStage = STAGES[next];
  const probMap = { TO_CONTACT: 10, CONTACTED: 25, MEETING_BOOKED: 45, PROPOSAL_SENT: 70, WON: 100 };
  await prisma.lead.update({
    where: { id: leadId },
    data: { stage: newStage, probability: probMap[newStage] },
  });
  revalidatePath("/director/crm");
}

export async function logOutreach(count) {
  const director = await prisma.user.findFirst({ where: { role: "DIRECTOR" } });
  if (!director) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await prisma.outreachActivity.findFirst({
    where: { userId: director.id, date: { gte: today } },
  });
  if (existing) {
    await prisma.outreachActivity.update({
      where: { id: existing.id },
      data: { completed: existing.completed + count },
    });
  } else {
    await prisma.outreachActivity.create({
      data: { userId: director.id, date: new Date(), target: 25, completed: count, replies: 0, meetings: 0 },
    });
  }
  revalidatePath("/director/crm");
  revalidatePath("/director");
}
