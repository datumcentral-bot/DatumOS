import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.teamMember.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        subcontractor: { select: { id: true, companyName: true } },
        subAssignments: { include: { clientProject: { select: { code: true, name: true } } } },
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
    const row = await prisma.teamMember.create({
      data: {
        name: b.name,
        email: b.email || null,
        role: b.role || "MODELER",
        division: b.division || null,
        seniority: b.seniority || "MID",
        ratePerHr: Number(b.ratePerHr) || 0,
        skills: b.skills || null,
        avatarHue: b.avatarHue || "#6b8e23",
        subcontractorId: b.subcontractorId || null,
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
    const { id, subcontractor, subAssignments, createdAt, ...data } = b;
    if (data.ratePerHr != null) data.ratePerHr = Number(data.ratePerHr);
    const row = await prisma.teamMember.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.subAssignment.deleteMany({ where: { teamMemberId: id } });
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
