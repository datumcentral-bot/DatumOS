import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req, { params }) {
  const body = await req.json()
  const { id, airId, assetClass, priority, order, ...rest } = body
  const data = await prisma.airSection.update({ where: { id: params.secId }, data: rest })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  await prisma.airSection.delete({ where: { id: params.secId } })
  return NextResponse.json({ ok: true })
}
