import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, companyName: true } } },
    });
    const users = await prisma.user.findMany({ where: { active: true }, select: { id: true, name: true, role: true, title: true } });
    return NextResponse.json({ projects, users });
  } catch (e) { return errorResponse(e, req) }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const { id, client, assignments, divisions, ...rest } = b;
    const p = await prisma.project.create({ data: { ...rest, clientId: rest.clientId || undefined } });
    return NextResponse.json(p, { status: 201 });
  } catch (e) { return errorResponse(e, req) }
}

export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const { id, client, assignments, divisions, _count, ...rest } = b;
    const p = await prisma.project.update({ where: { id }, data: { ...rest, clientId: rest.clientId || undefined } });
    return NextResponse.json(p);
  } catch (e) { return errorResponse(e, req) }
}

export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e, req) }
}
