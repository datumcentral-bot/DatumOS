import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Combined EIR + AIR register. The canonical schema keeps Eir and
// Air as separate models (each with its own sections table); this
// route merges both into one list carrying a `kind` discriminator.
// Previously referenced a non-existent `eirAir` model, which threw
// "Cannot read properties of undefined (reading 'findMany')".

const PROJECT_PICK = { select: { code: true, name: true } };

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("clientProjectId");
    const where = projectId ? { projectId } : {};
    const eirs = await prisma.eir.findMany({ where, orderBy: { createdAt: "desc" }, include: { project: PROJECT_PICK } });
    const airs = await prisma.air.findMany({ where, orderBy: { createdAt: "desc" }, include: { project: PROJECT_PICK } });
    const rows = [
      ...eirs.map((e) => ({ ...e, kind: "EIR" })),
      ...airs.map((a) => ({ ...a, kind: "AIR" })),
    ];
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
    const kind = (b.kind || "EIR").toUpperCase();
    const projectId = b.projectId || b.clientProjectId;
    if (kind === "AIR") {
      const row = await prisma.air.create({
        data: {
          projectId,
          title: b.title || b.ref || "AIR",
          version: b.version || "1.0",
          status: b.status || "DRAFT",
          assetType: b.assetType || null,
          requirements: b.requirements || b.requirement || null,
          dataFields: b.dataFields || null,
        },
      });
      return NextResponse.json({ ...row, kind: "AIR" }, { status: 201 });
    }
    const row = await prisma.eir.create({
      data: {
        projectId,
        title: b.title || b.ref || "EIR",
        version: b.version || "1.0",
        status: b.status || "DRAFT",
        purpose: b.purpose || null,
        scope: b.scope || null,
        requirements: b.requirements || b.requirement || null,
        deliverables: b.deliverables || null,
        standards: b.standards || null,
      },
    });
    return NextResponse.json({ ...row, kind: "EIR" }, { status: 201 });
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const b = await req.json();
    const { id, kind, project, createdAt, updatedAt, ...data } = b;
    const isAir = (kind || "").toUpperCase() === "AIR";
    const row = isAir
      ? await prisma.air.update({ where: { id }, data })
      : await prisma.eir.update({ where: { id }, data });
    return NextResponse.json({ ...row, kind: isAir ? "AIR" : "EIR" });
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
    const kind = (searchParams.get("kind") || "EIR").toUpperCase();
    if (kind === "AIR") {
      await prisma.air.delete({ where: { id } });
    } else {
      await prisma.eir.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req)
  }
}
