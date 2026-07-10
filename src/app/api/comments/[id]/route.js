import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.comment.update({ where: { id: params.id }, data: { body: body.body } })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.comment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
