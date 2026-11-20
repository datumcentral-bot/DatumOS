import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const r = await prisma.clientRequirement.create({
      data: {
        clientId: b.clientId,
        category: b.category || "FUNCTIONAL",
        title: b.title,
        detail: b.detail || null,
        priority: b.priority || "MEDIUM",
        status: b.status || "CAPTURED",
      },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const { id, clientId, createdAt, ...data } = b;
    const r = await prisma.clientRequirement.update({ where: { id }, data });
    return NextResponse.json(r);
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.clientRequirement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req)
  }
}
