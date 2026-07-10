import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clientProjectId = searchParams.get("clientProjectId");
    if (clientProjectId) {
      const bep = await prisma.bimExecutionPlan.findUnique({ where: { clientProjectId } });
      return NextResponse.json(bep);
    }
    const beps = await prisma.bimExecutionPlan.findMany({
      include: { clientProject: { select: { code: true, name: true } } },
    });
    return NextResponse.json(beps);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const data = {
      clientProjectId: b.clientProjectId,
      bepType: b.bepType || "PRE_APPOINTMENT",
      cdePlatform: b.cdePlatform || null,
      loin: b.loin || null,
      namingConvention: b.namingConvention || null,
      softwarePlatforms: b.softwarePlatforms || null,
      milestonesJson: b.milestonesJson || null,
      standards: b.standards || null,
      status: b.status || "DRAFT",
      version: b.version || "1.0",
    };
    const bep = await prisma.bimExecutionPlan.upsert({
      where: { clientProjectId: b.clientProjectId },
      update: data,
      create: data,
    });
    return NextResponse.json(bep, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
