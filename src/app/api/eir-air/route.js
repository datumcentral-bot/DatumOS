import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clientProjectId = searchParams.get("clientProjectId");
    const rows = await prisma.eirAir.findMany({
      where: clientProjectId ? { clientProjectId } : undefined,
      orderBy: { createdAt: "desc" },
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
    const row = await prisma.eirAir.create({
      data: {
        clientProjectId: b.clientProjectId,
        kind: b.kind || "EIR",
        ref: b.ref,
        requirement: b.requirement,
        responseNote: b.responseNote || null,
        status: b.status || "OPEN",
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
    const row = await prisma.eirAir.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.eirAir.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
