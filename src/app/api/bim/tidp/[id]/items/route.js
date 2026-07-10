import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const data = await prisma.tidpItem.findMany({ where: { tidpId: params.id }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(data)
}

export async function POST(req, { params }) {
  const body = await req.json()
  const { id, tidpId, element, responsible, lodRequired, plannedDate, ...rest } = body
  const data = await prisma.tidpItem.create({
    data: {
      ...rest,
      tidpId: params.id,
      lodLevel: lodRequired,
      dueDate: plannedDate ? new Date(plannedDate) : undefined
    }
  })
  return NextResponse.json(data, { status: 201 })
}
