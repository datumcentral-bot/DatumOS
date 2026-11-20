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
    const category = searchParams.get('category')
    const where = {}
    if (projectId) where.projectId = projectId
    if (category) where.category = category
    const data = await prisma.kpiMetric.findMany({ where, orderBy: { recordedAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const body = await req.json()
    const { id, ...rest } = body
    // Map frontend fields to schema fields
    const data = await prisma.kpiMetric.create({
      data: {
        name: rest.name,
        value: parseFloat(rest.value) || 0,
        target: rest.target ? parseFloat(rest.target) : null,
        unit: rest.unit || null,
        category: rest.category || null,
        period: rest.period || null,
        notes: rest.notes || null,
        projectId: rest.projectId || null,
      }
    })
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
    const { id: bodyId, ...rest } = body
    const data = await prisma.kpiMetric.update({
      where: { id: id || bodyId },
      data: {
        name: rest.name,
        value: parseFloat(rest.value) || 0,
        target: rest.target ? parseFloat(rest.target) : null,
        unit: rest.unit || null,
        category: rest.category || null,
        period: rest.period || null,
        notes: rest.notes || null,
        projectId: rest.projectId || null,
      }
    })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}

export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.kpiMetric.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return errorResponse(e, req)}
}
