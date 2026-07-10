import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where = status ? { status } : {}
  const data = await prisma.client.findMany({ where, include: { _count: { select: { projects: true, requirements: true, assessments: true } }, contacts: true }, orderBy: { companyName: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { contacts, requirements, assessments, documents, projects, invoices, leads, portalUsers, tier, leadMember, repTeam, priority, ...rest } = body
  const data = await prisma.client.create({ data: {
    ...rest,
    tier: tier || 'TIER2',
    leadMember: leadMember || null,
    repTeam: repTeam || null,
    priority: priority || 'MEDIUM',
    contacts: contacts ? { create: contacts } : undefined,
    requirements: requirements ? { create: requirements } : undefined,
  }, include: { contacts: true, _count: { select: { projects: true } } } })
  return NextResponse.json(data, { status: 201 })
}
