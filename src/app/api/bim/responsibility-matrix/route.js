import { NextResponse } from 'next/server'
import { sanitize } from '@/lib/sanitize'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.responsibilityMatrix.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { discipline: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const raw = await req.json()
  const body = sanitize(raw)
  const data = await prisma.responsibilityMatrix.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
