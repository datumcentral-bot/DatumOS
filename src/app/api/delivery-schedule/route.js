import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.deliverySchedule.findMany({ where, include: { project: { select: { name: true, code: true } } }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const body = await req.json()
    const { id, project, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    if (rest.startDate === '') rest.startDate = null
    if (rest.endDate === '') rest.endDate = null
    const data = await prisma.deliverySchedule.create({ data: rest })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return errorResponse(e, req)}
}

export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { id: bodyId, project, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    if (rest.startDate === '') rest.startDate = null
    if (rest.endDate === '') rest.endDate = null
    const data = await prisma.deliverySchedule.update({ where: { id: id || bodyId }, data: rest })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}

export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.deliverySchedule.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return errorResponse(e, req)}
}
