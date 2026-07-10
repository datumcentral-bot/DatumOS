import { NextResponse } from 'next/server'
import { sanitize } from '@/lib/sanitize'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const raw = await req.json()
  const body = sanitize(raw)
  const data = await prisma.lodSpec.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.lodSpec.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
