import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const where = {}
  if (projectId) where.projectId = projectId
  if (status) where.status = status
  const data = await prisma.cdeDocument.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.cdeDocument.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
