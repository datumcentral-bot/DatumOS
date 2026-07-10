import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.midp.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } }, deliverables: true, tidps: { include: { items: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { deliverables, tidps, ...rest } = body
  const data = await prisma.midp.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.midp.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
