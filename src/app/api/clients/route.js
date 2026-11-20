import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES } from '@/lib/auth'

// DN019 hardening: client records (CRM) are DIRECTOR-only. Client portal
// users read their scoped data via /api/client-projects / /api/client.

const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  // DN019: use OR condition on client active status so both active and inactive
  // clients are selectable when associating with projects (D02).
  let where = {
    OR: [
      { status: "ACTIVE" },
      { status: "INACTIVE" },
    ],
  }
  // If the caller supplied a status filter, replace the OR block with a single-status where:
  const suppliedStatus = searchParams.get('status')
  if (suppliedStatus) {
    where = { status: suppliedStatus }
  }
  const data = await prisma.client.findMany({ where, include: { _count: { select: { projects: true, requirements: true, assessments: true } }, contacts: true }, orderBy: { companyName: 'asc' } })
  return NextResponse.json(data)
}, ROLES.DIRECTOR)

const POST = withAuth(async (req) => {
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
}, ROLES.DIRECTOR)

export { GET, POST }