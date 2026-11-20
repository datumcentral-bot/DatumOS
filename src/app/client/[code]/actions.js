"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendClientMessage(projectId, body, code) {
  if (!body || !body.trim()) return;
  await prisma.clientMessage.create({
    data: {
      projectId,
      authorName: "James Whitfield",
      authorSide: "CLIENT",
      body: body.trim(),
    },
  });
  revalidatePath(`/client/${code}`);
}
