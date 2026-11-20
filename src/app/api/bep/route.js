import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Aligned to the canonical Prisma `Bep` model
// (id, projectId, title, version, status, projectInfo,
//  objectives, standards, software, coordination,
//  qualityPlan, deliveryPlan). Previously referenced a
//  non-existent `bimExecutionPlan` model and a `clientProject`
//  relation, which threw "Cannot read properties of undefined
//  (reading 'findMany')" on every call.

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("clientProjectId");
    if (projectId) {
      const bep = await prisma.bep.findFirst({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(bep);
    }
    const beps = await prisma.bep.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { code: true, name: true } } },
    });
    return NextResponse.json(beps);
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const data = {
      projectId: b.projectId || b.clientProjectId,
      title: b.title || b.bepType || "BEP",
      version: b.version || "1.0",
      status: b.status || "DRAFT",
      projectInfo: b.projectInfo || null,
      objectives: b.objectives || null,
      standards: b.standards || null,
      software: b.software || b.softwarePlatforms || null,
      coordination: b.coordination || null,
      qualityPlan: b.qualityPlan || null,
      deliveryPlan: b.deliveryPlan || null,
    };
    const bep = await prisma.bep.create({ data });
    return NextResponse.json(bep, { status: 201 });
  } catch (e) {
    return errorResponse(e, req)
  }
}
