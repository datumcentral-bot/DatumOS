import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const d = await prisma.deliverable.findMany({ where: { clientProjectId: params.id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json(d);
  } catch (e) { return errorResponse(e, req) }
}

export async function POST(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const d = await prisma.deliverable.create({ data: {
      clientProjectId: params.id, name: b.name, discipline: b.discipline || null,
      loi: b.loi || "LOD300", container: b.container || null,
      dueDate: b.dueDate ? new Date(b.dueDate) : null,
      status: b.status || "PLANNED", responsible: b.responsible || null,
    }});
    return NextResponse.json(d, { status: 201 });
  } catch (e) { return errorResponse(e, req) }
}
