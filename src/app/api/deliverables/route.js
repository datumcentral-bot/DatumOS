import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES, projectScopeWhere } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
const STAFF = [ROLES.DIRECTOR, ROLES.MEMBER];

async function canAccessProject(projectId, session) {
  if (!projectId) return false;
  const project = await prisma.project.findFirst({
    where: { AND: [{ id: projectId }, projectScopeWhere(session)] },
    select: { id: true },
  });
  return Boolean(project);
}

const GET = withAuth(async (req, _ctx, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("clientProjectId");
    if (projectId && !(await canAccessProject(projectId, session))) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }
    const where = projectId ? { projectId } : session.user.role === ROLES.DIRECTOR
      ? {}
      : { project: projectScopeWhere(session) };
    const rows = await prisma.deliverable.findMany({
      where,
      orderBy: { dueDate: "asc" },
      include: { project: { select: { code: true, name: true } } },
    });
    return NextResponse.json(rows);
  } catch (e) {
    return errorResponse(e, req);
  }
}, ...STAFF);

const POST = withAuth(async (req, _ctx, session) => {
  try {
    const b = await req.json();
    const projectId = b.projectId || b.clientProjectId;
    if (!(await canAccessProject(projectId, session))) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }
    const row = await prisma.deliverable.create({
      data: {
        projectId,
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
    return errorResponse(e, req);
  }
}, ...STAFF);

const PUT = withAuth(async (req, _ctx, session) => {
  try {
    const b = await req.json();
    const { id, project, createdAt, clientProjectId, ...data } = b;
    if (!id) return NextResponse.json({ error: "Deliverable id is required" }, { status: 400 });
    const existing = await prisma.deliverable.findFirst({
      where: { id, project: projectScopeWhere(session) },
      select: { id: true, projectId: true },
    });
    if (!existing) return NextResponse.json({ error: "Deliverable not found or access denied" }, { status: 404 });
    const targetProjectId = data.projectId || existing.projectId;
    if (!(await canAccessProject(targetProjectId, session))) {
      return NextResponse.json({ error: "Target project not found or access denied" }, { status: 404 });
    }
    delete data.projectId;
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    const row = await prisma.deliverable.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    return errorResponse(e, req);
  }
}, ...STAFF);

const DELETE = withAuth(async (req, _ctx, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Deliverable id is required" }, { status: 400 });
    const existing = await prisma.deliverable.findFirst({
      where: { id, project: projectScopeWhere(session) },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Deliverable not found or access denied" }, { status: 404 });
    await prisma.deliverable.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, req);
  }
}, ROLES.DIRECTOR);

export { GET, POST, PUT, DELETE };
