import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const meetingId = searchParams.get('meetingId')
  const where = meetingId ? { meetingId } : {}
  const data = await prisma.actionItem.findMany({ where, include: { assignee: { select: { name: true } } }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.actionItem.create({ data: body, include: { assignee: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
