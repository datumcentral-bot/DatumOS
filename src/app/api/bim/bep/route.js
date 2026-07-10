import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.bep.findMany({ where, include: { project: { select: { name: true, code: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.bep.create({ data: body, include: { project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
