import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const projectId = searchParams.get('projectId')
  const where = {}
  if (userId) where.userId = userId
  if (projectId) where.projectId = projectId
  const data = await prisma.resourceAllocation.findMany({ where, include: { user: { select: { name: true, capacityHrs: true } }, project: { select: { name: true } } }, orderBy: { weekStart: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.resourceAllocation.create({ data: { ...body, weekStart: new Date(body.weekStart) } })
  return NextResponse.json(data, { status: 201 })
}
