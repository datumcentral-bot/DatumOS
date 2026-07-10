import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const entity = searchParams.get('entity')
  const where = entity ? { entity } : {}
  const data = await prisma.activityLog.findMany({ where, include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: 'desc' }, take: 200 })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.activityLog.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
