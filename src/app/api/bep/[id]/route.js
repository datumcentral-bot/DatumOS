import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function PUT(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const { id, clientProject, createdAt, ...data } = b;
    const bep = await prisma.bimExecutionPlan.update({ where: { id: params.id }, data });
    return NextResponse.json(bep);
  } catch (e) { return errorResponse(e, req) }
}

export async function DELETE(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    await prisma.bimExecutionPlan.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e, req) }
}
