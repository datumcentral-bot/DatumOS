import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req, { params }) {
  const body = await req.json()
  const { id, midpId, ...rest } = body
  const data = await prisma.midpDeliverable.update({ where: { id: params.delivId }, data: rest })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  await prisma.midpDeliverable.delete({ where: { id: params.delivId } })
  return NextResponse.json({ ok: true })
}
