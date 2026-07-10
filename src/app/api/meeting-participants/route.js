import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const meetingId = searchParams.get('meetingId')
  const where = meetingId ? { meetingId } : {}
  const data = await prisma.meetingParticipant.findMany({ where, include: { user: { select: { name: true, email: true } } } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.meetingParticipant.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
