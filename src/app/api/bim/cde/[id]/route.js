import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard, getSession, ROLES, getClientEntityId } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR, ROLES.CLIENT);
  if (denied) return denied;
  const data = await prisma.cdeDocument.findUnique({ where: { id: params.id }, include: { project: { select: { clientId: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Tenant scoping: a CLIENT may only read documents under its own project.
  const session = await getSession();
  if (session?.user?.role === ROLES.CLIENT && data.project?.clientId !== getClientEntityId(session)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function PUT(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR);
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.cdeDocument.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function DELETE(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR);
  if (denied) return denied;
  await prisma.cdeDocument.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
