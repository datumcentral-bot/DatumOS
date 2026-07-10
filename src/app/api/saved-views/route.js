import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const module = searchParams.get('module')
  const where = {}
  if (userId) where.userId = userId
  if (module) where.module = module
  const data = await prisma.savedView.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.savedView.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
