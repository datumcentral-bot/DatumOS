import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const where = {}
  if (projectId) where.projectId = projectId
  if (status) where.status = status
  const data = await prisma.meeting.findMany({ where, include: { project: { select: { name: true } }, participants: { include: { user: { select: { name: true } } } }, _count: { select: { actionItems: true, minutes: true } } }, orderBy: { scheduledAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { participants, ...rest } = body
  const data = await prisma.meeting.create({ data: { ...rest, participants: participants ? { create: participants } : undefined }, include: { participants: true, project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
