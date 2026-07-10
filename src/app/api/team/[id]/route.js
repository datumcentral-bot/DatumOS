import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.user.findUnique({ where: { id: params.id }, include: { tasks: { select: { id: true, title: true, status: true, priority: true } }, assignments: { include: { project: { select: { name: true } } } }, resourceAllocations: { orderBy: { weekStart: 'desc' }, take: 8 } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...data, password: undefined })
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { password, tasks, assignments, resourceAllocations, ...rest } = body
  const data = await prisma.user.update({ where: { id: params.id }, data: rest })
  return NextResponse.json({ ...data, password: undefined })
}
export async function DELETE(req, { params }) {
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
