import { NextResponse } from 'next/server'
import { sanitize } from '@/lib/sanitize'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.bimVerifyCheck.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const raw = await req.json()
  const body = sanitize(raw)
  const data = await prisma.bimVerifyCheck.create({ data: body, include: { project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
