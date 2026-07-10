import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const d = await prisma.deliverable.findMany({ where: { clientProjectId: params.id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json(d);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req, { params }) {
  try {
    const b = await req.json();
    const d = await prisma.deliverable.create({ data: {
      clientProjectId: params.id, name: b.name, discipline: b.discipline || null,
      loi: b.loi || "LOD300", container: b.container || null,
      dueDate: b.dueDate ? new Date(b.dueDate) : null,
      status: b.status || "PLANNED", responsible: b.responsible || null,
    }});
    return NextResponse.json(d, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
