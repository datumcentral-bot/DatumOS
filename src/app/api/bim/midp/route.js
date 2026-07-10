import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.midp.findMany({ where, include: { project: { select: { name: true } }, deliverables: true, tidps: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { deliverables, ...rest } = body
  const data = await prisma.midp.create({ data: { ...rest, deliverables: deliverables ? { create: deliverables } : undefined }, include: { deliverables: true } })
  return NextResponse.json(data, { status: 201 })
}
