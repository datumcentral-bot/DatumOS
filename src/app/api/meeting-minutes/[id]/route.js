import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.meetingMinute.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.meetingMinute.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
