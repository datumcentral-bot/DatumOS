import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function PATCH(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { id } = params;
    const notif = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return NextResponse.json(notif);
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function DELETE(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { id } = params;
    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e, req)
  }
}
