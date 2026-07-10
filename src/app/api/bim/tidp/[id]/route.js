import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.tidp.findUnique({ where: { id: params.id }, include: { items: true, project: { select: { name: true } }, midp: { select: { title: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { items, ...rest } = body
  const data = await prisma.tidp.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.tidp.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
