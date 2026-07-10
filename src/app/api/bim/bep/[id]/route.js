import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.bep.findUnique({ where: { id: params.id }, include: { project: { select: { name: true, code: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.bep.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.bep.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
