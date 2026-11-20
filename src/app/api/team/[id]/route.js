import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const data = await prisma.user.findUnique({ where: { id: params.id }, include: { tasks: { select: { id: true, title: true, status: true, priority: true } }, assignments: { include: { project: { select: { name: true } } } }, resourceAllocations: { orderBy: { weekStart: 'desc' }, take: 8 } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...data, password: undefined })
 } catch (err) { return errorResponse(err, req); }}
export async function PUT(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { password, tasks, assignments, resourceAllocations, ...rest } = body
  const data = await prisma.user.update({ where: { id: params.id }, data: rest })
  return NextResponse.json({ ...data, password: undefined })
 } catch (err) { return errorResponse(err, req); }}
export async function DELETE(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
