import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, companyName: true } } },
    });
    const users = await prisma.user.findMany({ where: { active: true }, select: { id: true, name: true, role: true, title: true } });
    return NextResponse.json({ projects, users });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const { id, client, assignments, divisions, ...rest } = b;
    const p = await prisma.project.create({ data: { ...rest, clientId: rest.clientId || undefined } });
    return NextResponse.json(p, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req) {
  try {
    const b = await req.json();
    const { id, client, assignments, divisions, _count, ...rest } = b;
    const p = await prisma.project.update({ where: { id }, data: { ...rest, clientId: rest.clientId || undefined } });
    return NextResponse.json(p);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
