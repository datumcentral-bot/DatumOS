import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.eir.findUnique({ where: { id: params.id }, include: { sections: { orderBy: { orderIndex: 'asc' } }, project: { select: { name: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { sections, ...rest } = body
  const data = await prisma.eir.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.eir.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
