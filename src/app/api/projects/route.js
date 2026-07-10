import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')
  const where = {}
  if (clientId) where.clientId = clientId
  if (status) where.status = status
  const data = await prisma.project.findMany({ where, include: { client: { select: { companyName: true } }, assignments: { include: { user: { select: { name: true, avatarHue: true } } } }, _count: { select: { tasks: true, milestones: true, cdeDocs: true, clashDetections: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { assignments, divisions, ...rest } = body
  const data = await prisma.project.create({ data: { ...rest, assignments: assignments ? { create: assignments } : undefined, divisions: divisions ? { create: divisions } : undefined }, include: { client: { select: { companyName: true } } } })
  return NextResponse.json(data, { status: 201 })
}
