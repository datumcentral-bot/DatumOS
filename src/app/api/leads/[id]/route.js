import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES } from '@/lib/auth'

// DN019 hardening: single-lead reads/writes are DIRECTOR-only.

export const GET = withAuth(async (req, { params }) => {
  const data = await prisma.lead.findUnique({ where: { id: params.id } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}, ROLES.DIRECTOR)

export const PUT = withAuth(async (req, { params }) => {
  const body = await req.json()
  const data = await prisma.lead.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}, ROLES.DIRECTOR)

export const DELETE = withAuth(async (req, { params }) => {
  await prisma.lead.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}, ROLES.DIRECTOR)