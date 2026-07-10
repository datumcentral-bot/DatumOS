import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const data = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.tag.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
