import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const weekStart = searchParams.get('weekStart')
  const where = weekStart ? { weekStart: new Date(weekStart) } : {}
  const allocations = await prisma.resourceAllocation.findMany({ where, include: { user: { select: { name: true, capacityHrs: true, avatarHue: true } }, project: { select: { name: true, code: true } } } })
  const users = await prisma.user.findMany({ where: { active: true, role: { not: 'CLIENT' } }, select: { id: true, name: true, capacityHrs: true, avatarHue: true, title: true } })
  return NextResponse.json({ allocations, users })
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.resourceAllocation.create({ data: { ...body, weekStart: new Date(body.weekStart) } })
  return NextResponse.json(data, { status: 201 })
}
