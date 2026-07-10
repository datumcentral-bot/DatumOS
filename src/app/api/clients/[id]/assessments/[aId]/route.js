import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.clientAssessment.update({ where: { id: params.aId }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.clientAssessment.delete({ where: { id: params.aId } })
  return NextResponse.json({ ok: true })
}
