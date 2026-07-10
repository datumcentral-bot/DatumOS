import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.clientRequirement.update({ where: { id: params.reqId }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.clientRequirement.delete({ where: { id: params.reqId } })
  return NextResponse.json({ ok: true })
}
