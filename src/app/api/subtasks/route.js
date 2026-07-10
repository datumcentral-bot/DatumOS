import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const parentId = searchParams.get('parentId')
  const where = parentId ? { parentId } : { parentId: { not: null } }
  const data = await prisma.task.findMany({ where, include: { assignee: { select: { name: true } } }, orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.task.create({ data: body, include: { assignee: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
