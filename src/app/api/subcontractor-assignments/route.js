import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Aligned to the canonical Prisma `SubcontractorAssignment` model
// (id, subcontractorId, projectId, scope, startDate, endDate,
//  status, performanceScore, notes). Previously used a non-existent
//  `subAssignment` model, a `teamMember` relation and a `clientProject`
//  relation — all of which threw "Cannot read properties of undefined
//  (reading 'findMany')".

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("clientProjectId");
    const rows = await prisma.subcontractorAssignment.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: "desc" },
      include: {
        subcontractor: { select: { companyName: true, specialization: true } },
        project: { select: { code: true, name: true } },
      },
    });
    return NextResponse.json(rows);
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const row = await prisma.subcontractorAssignment.create({
      data: {
        subcontractorId: b.subcontractorId || b.teamMemberId,
        projectId: b.projectId || b.clientProjectId,
        scope: b.scope || b.scopeNote || null,
        startDate: b.startDate ? new Date(b.startDate) : null,
        endDate: b.endDate ? new Date(b.endDate) : null,
        status: b.status || "ACTIVE",
        performanceScore: b.performanceScore != null ? Number(b.performanceScore) : null,
        notes: b.notes || null,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const {
      id,
      subcontractor,
      project,
      teamMember,
      clientProject,
      createdAt,
      ...data
    } = b;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.performanceScore != null) data.performanceScore = Number(data.performanceScore);
    const row = await prisma.subcontractorAssignment.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.subcontractorAssignment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req)
  }
}
