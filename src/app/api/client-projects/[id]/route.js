import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const p = await prisma.clientProject.findUnique({
      where: { id: params.id },
      include: {
        client: true, files: { orderBy: { createdAt: "desc" } },
        bep: true, eirAir: true, deliverables: true,
        subAssignments: { include: { teamMember: true } },
      },
    });
    return NextResponse.json(p);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req, { params }) {
  try {
    const b = await req.json();
    const { id, client, files, bep, eirAir, deliverables, subAssignments, createdAt, ...data } = b;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.contractValue != null) data.contractValue = Number(data.contractValue);
    if (data.progress != null) data.progress = Number(data.progress);
    const p = await prisma.clientProject.update({ where: { id: params.id }, data });
    return NextResponse.json(p);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.projectFile.deleteMany({ where: { clientProjectId: params.id } });
    await prisma.deliverable.deleteMany({ where: { clientProjectId: params.id } });
    await prisma.subAssignment.deleteMany({ where: { clientProjectId: params.id } });
    await prisma.eIrAir.deleteMany({ where: { clientProjectId: params.id } }).catch(() => {});
    await prisma.bimExecutionPlan.deleteMany({ where: { clientProjectId: params.id } }).catch(() => {});
    await prisma.clientProject.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
