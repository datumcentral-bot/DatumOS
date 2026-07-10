import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.meeting.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } }, participants: { include: { user: { select: { name: true, email: true } } } }, minutes: { orderBy: { orderIndex: 'asc' } }, actionItems: { include: { assignee: { select: { name: true } } } }, comments: { include: { author: { select: { name: true } } } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { participants, minutes, actionItems, comments, ...rest } = body
  const data = await prisma.meeting.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.meeting.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
