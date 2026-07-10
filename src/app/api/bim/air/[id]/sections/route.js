import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const data = await prisma.airSection.findMany({ where: { airId: params.id }, orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req, { params }) {
  const body = await req.json()
  const { id, airId, assetClass, priority, order, ...rest } = body
  const count = await prisma.airSection.count({ where: { airId: params.id } })
  const data = await prisma.airSection.create({
    data: {
      ...rest,
      airId: params.id,
      sectionNo: String(count + 1),
      orderIndex: order || count
    }
  })
  return NextResponse.json(data, { status: 201 })
}
