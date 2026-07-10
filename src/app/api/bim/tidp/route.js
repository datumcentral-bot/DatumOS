import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const midpId = searchParams.get('midpId')
  const where = {}
  if (projectId) where.projectId = projectId
  if (midpId) where.midpId = midpId
  const data = await prisma.tidp.findMany({ where, include: { project: { select: { name: true } }, midp: { select: { title: true } }, items: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { items, ...rest } = body
  const data = await prisma.tidp.create({ data: { ...rest, items: items ? { create: items } : undefined }, include: { items: true } })
  return NextResponse.json(data, { status: 201 })
}
