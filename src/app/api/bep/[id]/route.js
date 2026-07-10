import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const b = await req.json();
    const { id, clientProject, createdAt, ...data } = b;
    const bep = await prisma.bimExecutionPlan.update({ where: { id: params.id }, data });
    return NextResponse.json(bep);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.bimExecutionPlan.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
