import { NextResponse } from 'next/server'
import { sanitize } from '@/lib/sanitize'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const discipline = searchParams.get('discipline')
  const where = {}
  if (projectId) where.projectId = projectId
  if (discipline) where.discipline = discipline
  const data = await prisma.modelProduction.findMany({
    where,
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { id, ...rest } = body
  const data = await prisma.modelProduction.create({
    data: {
      ...rest,
      plannedDate: rest.plannedDate ? new Date(rest.plannedDate) : undefined,
      actualDate: rest.actualDate ? new Date(rest.actualDate) : undefined,
      projectId: rest.projectId || undefined,
      assigneeId: rest.assigneeId || undefined
    },
    include: { project: { select: { name: true } }, assignee: { select: { name: true } } }
  })
  return NextResponse.json(data, { status: 201 })
}
