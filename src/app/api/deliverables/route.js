import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clientProjectId = searchParams.get("clientProjectId");
    const rows = await prisma.deliverable.findMany({
      where: clientProjectId ? { clientProjectId } : undefined,
      orderBy: { dueDate: "asc" },
      include: { clientProject: { select: { code: true, name: true } } },
    });
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const row = await prisma.deliverable.create({
      data: {
        clientProjectId: b.clientProjectId,
        name: b.name,
        discipline: b.discipline || null,
        loi: b.loi || "LOD300",
        container: b.container || null,
        dueDate: b.dueDate ? new Date(b.dueDate) : null,
        status: b.status || "PLANNED",
        responsible: b.responsible || null,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const b = await req.json();
    const { id, clientProject, createdAt, ...data } = b;
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    const row = await prisma.deliverable.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.deliverable.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
