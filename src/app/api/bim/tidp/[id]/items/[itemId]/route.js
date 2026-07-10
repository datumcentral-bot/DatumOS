import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req, { params }) {
  const body = await req.json()
  const { id, tidpId, element, responsible, lodRequired, plannedDate, ...rest } = body
  const data = await prisma.tidpItem.update({
    where: { id: params.itemId },
    data: {
      ...rest,
      lodLevel: lodRequired,
      dueDate: plannedDate ? new Date(plannedDate) : undefined
    }
  })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  await prisma.tidpItem.delete({ where: { id: params.itemId } })
  return NextResponse.json({ ok: true })
}
