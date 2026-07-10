import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.scopeOfWork.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
