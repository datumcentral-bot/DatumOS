import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const channel = searchParams.get('channel')
  const where = channel ? { channel } : {}
  const data = await prisma.internalMessage.findMany({ where, include: { author: { select: { name: true, avatarHue: true } } }, orderBy: { createdAt: 'asc' }, take: 100 })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.internalMessage.create({ data: body, include: { author: { select: { name: true, avatarHue: true } } } })
  return NextResponse.json(data, { status: 201 })
}
