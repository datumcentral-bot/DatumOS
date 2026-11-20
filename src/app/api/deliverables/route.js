import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import { withAuth, ROLES } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Aligned to the canonical Prisma `Deliverable` model
// (id, projectId, title, description, dueDate, status,
//  discipline, format). Previously filtered on a non-existent
//  `clientProjectId` field, included a non-existent `clientProject`
//  relation, and passed `where: undefined` (rejected by Prisma 5).

async function _GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("clientProjectId");
    const rows = await prisma.deliverable.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { dueDate: "asc" },
      include: { project: { select: { code: true, name: true } } },
    });
    return NextResponse.json(rows);
  } catch (e) {
    return errorResponse(e, req)
  }
}

async function _POST(req) {
  try {
    const b = await req.json();
    const row = await prisma.deliverable.create({
      data: {
        projectId: b.projectId || b.clientProjectId,
        title: b.title || b.name,
        description: b.description || null,
        discipline: b.discipline || null,
        format: b.format || null,
        dueDate: b.dueDate ? new Date(b.dueDate) : null,
        status: b.status || "PENDING",
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return errorResponse(e, req)
  }
}

async function _PUT(req) {
  try {
    const b = await req.json();
    const { id, project, createdAt, ...data } = b;
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    const row = await prisma.deliverable.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    return errorResponse(e, req)
  }
}

async function _DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.deliverable.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req)
  }
}

// ─────────────────────────────────────────────────────────────────────
// SECURITY (2026-10-10): this route had no in-handler authorisation.
// Verified before the fix: any authenticated session could read and write
// these records, including a CLIENT role. The edge middleware proved only
// that a session existed, never which records that session may touch.
// Allowed roles: DIRECTOR, MEMBER, REVIT. CLIENT users have their own scoped
// read-only portal endpoints and are intentionally excluded here.
// ─────────────────────────────────────────────────────────────────────
export const GET = withAuth(_GET, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
export const POST = withAuth(_POST, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
export const PUT = withAuth(_PUT, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
export const DELETE = withAuth(_DELETE, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
