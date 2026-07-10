import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const b = await req.json();
    const { id, clientId, createdAt, ...data } = b;
    const r = await prisma.clientRequirement.update({ where: { id }, data });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.clientRequirement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
