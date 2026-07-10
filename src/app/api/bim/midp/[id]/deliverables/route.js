import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const data = await prisma.midpDeliverable.findMany({ where: { midpId: params.id }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req, { params }) {
  const body = await req.json()
  const { id, ...rest } = body
  const data = await prisma.midpDeliverable.create({ data: { ...rest, midpId: params.id } })
  return NextResponse.json(data, { status: 201 })
}
