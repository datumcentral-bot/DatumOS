import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clientProjectId = searchParams.get("clientProjectId");
    const rows = await prisma.subAssignment.findMany({
      where: clientProjectId ? { clientProjectId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        teamMember: { include: { subcontractor: { select: { companyName: true } } } },
        clientProject: { select: { code: true, name: true } },
      },
    });
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const row = await prisma.subAssignment.create({
      data: {
        clientProjectId: b.clientProjectId,
        teamMemberId: b.teamMemberId,
        roleOnProject: b.roleOnProject || "MODELER",
        scopeNote: b.scopeNote || null,
        allocationPct: Number(b.allocationPct) || 50,
        performanceScore: Number(b.performanceScore) || 80,
        status: b.status || "ACTIVE",
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
    const { id, teamMember, clientProject, createdAt, ...data } = b;
    if (data.allocationPct != null) data.allocationPct = Number(data.allocationPct);
    if (data.performanceScore != null) data.performanceScore = Number(data.performanceScore);
    const row = await prisma.subAssignment.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.subAssignment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
