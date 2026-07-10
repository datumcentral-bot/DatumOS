import { NextResponse } from 'next/server'
import { sanitize } from '@/lib/sanitize'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.bimDeliveryMilestone.findMany({
    where,
    include: { project: { select: { name: true } } },
    orderBy: { dueDate: 'asc' }
  })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { id, ...rest } = body
  const data = await prisma.bimDeliveryMilestone.create({
    data: {
      ...rest,
      dueDate: rest.dueDate ? new Date(rest.dueDate) : new Date(),
      completedAt: rest.completedAt ? new Date(rest.completedAt) : undefined,
      projectId: rest.projectId || undefined
    },
    include: { project: { select: { name: true } } }
  })
  return NextResponse.json(data, { status: 201 })
}
