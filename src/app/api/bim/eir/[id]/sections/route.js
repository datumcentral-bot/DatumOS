import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const data = await prisma.eirSection.findMany({ where: { eirId: params.id }, orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req, { params }) {
  const body = await req.json()
  const { id, eirId, category, order, ...rest } = body
  const count = await prisma.eirSection.count({ where: { eirId: params.id } })
  const data = await prisma.eirSection.create({
    data: {
      ...rest,
      eirId: params.id,
      sectionNo: String(count + 1),
      orderIndex: order || count
    }
  })
  return NextResponse.json(data, { status: 201 })
}
