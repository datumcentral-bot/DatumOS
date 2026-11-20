import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const data = await prisma.meeting.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } }, participants: { include: { user: { select: { name: true, email: true } } } }, minutes: { orderBy: { orderIndex: 'asc' } }, actionItems: { include: { assignee: { select: { name: true } } } }, comments: { include: { author: { select: { name: true } } } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function PUT(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { participants, minutes, actionItems, comments, ...rest } = body
  const data = await prisma.meeting.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function DELETE(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  await prisma.meeting.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
