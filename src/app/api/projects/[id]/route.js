import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard, getSession, ROLES, getClientEntityId } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR, ROLES.MEMBER, ROLES.CLIENT);
  if (denied) return denied;
  const data = await prisma.project.findUnique({ where: { id: params.id }, include: { client: true, assignments: { include: { user: { select: { name: true, title: true, avatarHue: true } } } }, tasks: { include: { assignee: { select: { name: true } } }, orderBy: { orderIndex: 'asc' } }, milestones: { orderBy: { dueDate: 'asc' } }, deliverables: true, projectFiles: { orderBy: { uploadedAt: 'desc' } }, beps: true, midps: { include: { deliverables: true } }, eirs: { include: { sections: true } }, airs: { include: { sections: true } }, cdeDocs: { orderBy: { createdAt: 'desc' } }, clashDetections: { orderBy: { createdAt: 'desc' } }, _count: { select: { tasks: true, milestones: true, cdeDocs: true, clashDetections: true, risks: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Tenant scoping: a CLIENT may only read its own project. Return 404 (not
  // 403) so the existence of another tenant's project is not disclosed.
  const session = await getSession();
  if (session?.user?.role === ROLES.CLIENT && data.clientId !== getClientEntityId(session)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function PUT(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR, ROLES.MEMBER);
  if (denied) return denied;
  const body = await req.json()
  const { assignments, divisions, tasks, milestones, deliverables, projectFiles, beps, midps, eirs, airs, cdeDocs, clashDetections, client, ...rest } = body
  const data = await prisma.project.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function DELETE(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR, ROLES.MEMBER);
  if (denied) return denied;
  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
