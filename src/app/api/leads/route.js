import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcast } from '@/lib/broadcast'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const where = stage ? { stage } : {}
  const data = await prisma.lead.findMany({ where, orderBy: [{ stage: 'asc' }, { orderIndex: 'asc' }] })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const data = await prisma.lead.create({ data: body })
  broadcast('leads', 'created', data, body.assignedTo || 'Director')
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const b = await req.json()
    const { id: bid, ...rest } = b
    const data = await prisma.lead.update({ where: { id: id || bid }, data: rest })
    broadcast('leads', 'updated', data, 'Director')
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.lead.delete({ where: { id } })
    broadcast('leads', 'deleted', { id }, 'Director')
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
