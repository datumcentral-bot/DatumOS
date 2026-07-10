import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.air.findMany({ where, include: { project: { select: { name: true } }, sections: { orderBy: { orderIndex: 'asc' } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { sections, ...rest } = body
  const data = await prisma.air.create({ data: { ...rest, sections: sections ? { create: sections } : undefined }, include: { sections: true } })
  return NextResponse.json(data, { status: 201 })
}
