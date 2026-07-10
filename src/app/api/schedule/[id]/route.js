import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const { project, ...rest } = body
  const data = await prisma.scheduleItem.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.scheduleItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
