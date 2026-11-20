import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const scopes = await prisma.scopeOfWork.findMany({
      orderBy: [{ projectId: "asc" }, { orderIndex: "asc" }],
      include: { project: { select: { code: true, name: true } } },
    });
    return NextResponse.json(scopes);
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const body = await req.json();
    const scope = await prisma.scopeOfWork.create({
      data: {
        title: body.title,
        divisionCode: body.divisionCode || "BIM",
        description: body.description || null,
        status: body.status || "PLANNED",
        budgetHrs: parseFloat(body.budgetHrs) || 0,
        projectId: body.projectId,
      },
    });
    return NextResponse.json(scope, { status: 201 });
  } catch (e) {
    return errorResponse(e, req)
  }
}
