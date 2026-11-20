"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function decideApproval(approvalId, decision, markup) {
  await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: decision, // APPROVED | CHANGES_REQUESTED
      markup: markup || null,
      reviewer: "James Whitfield",
      decidedAt: new Date(),
    },
  });
  revalidatePath("/client/approvals");
  revalidatePath("/client");
}
