import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function PUT(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const body = await req.json();
    const scope = await prisma.scopeOfWork.update({
      where: { id: params.id },
      data: {
        title: body.title,
        divisionCode: body.divisionCode,
        description: body.description || null,
        status: body.status,
        budgetHrs: parseFloat(body.budgetHrs) || 0,
        projectId: body.projectId,
      },
    });
    return NextResponse.json(scope);
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function DELETE(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    await prisma.scopeOfWork.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req)
  }
}
