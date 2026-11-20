import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcast } from '@/lib/broadcast'
import { withAuth, ROLES } from '@/lib/auth'

// DN019 hardening: CRM leads are DIRECTOR-only. Public lead capture remains
// at /api/public/lead (marketing site). Previously fully unauthenticated.

const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const where = stage ? { stage } : {}
  const data = await prisma.lead.findMany({ where, orderBy: [{ stage: 'asc' }, { orderIndex: 'asc' }] })
  return NextResponse.json(data)
}, ROLES.DIRECTOR)

const POST = withAuth(async (req) => {
  const body = await req.json()
  const data = await prisma.lead.create({ data: body })
  broadcast('leads', 'created', data, body.assignedTo || 'Director')
  return NextResponse.json(data, { status: 201 })
}, ROLES.DIRECTOR)

const PUT = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const b = await req.json()
  const { id: bid, ...rest } = b
  const data = await prisma.lead.update({ where: { id: id || bid }, data: rest })
  broadcast('leads', 'updated', data, 'Director')
  return NextResponse.json(data)
}, ROLES.DIRECTOR)

const DELETE = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await prisma.lead.delete({ where: { id } })
  broadcast('leads', 'deleted', { id }, 'Director')
  return NextResponse.json({ ok: true })
}, ROLES.DIRECTOR)

export { GET, POST, PUT, DELETE }