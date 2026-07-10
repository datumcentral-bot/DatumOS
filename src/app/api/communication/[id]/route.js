import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function DELETE(req, { params }) {
  await prisma.internalMessage.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
