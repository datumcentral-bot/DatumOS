import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES, getClientEntityId } from '@/lib/auth'

// SECURITY (2026-10-10): the client portal reads CDE documents from this route.
// It had no in-handler authorisation and no tenant scoping, so any authenticated
// session - including a CLIENT - could list every CDE document in the platform by
// omitting ?projectId.
//
// A CLIENT is now pinned to the projects belonging to its own client record, and
// a supplied projectId cannot widen that. Staff are unaffected.
export const dynamic = "force-dynamic";

const STAFF = [ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT]

async function ownProjectIds(session) {
  const clientId = getClientEntityId(session)
  if (!clientId) return []
  const rows = await prisma.project.findMany({ where: { clientId }, select: { id: true } })
  return rows.map((r) => r.id)
}

const GET = withAuth(async (req, _ctx, session) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where = {}

  if (session?.user?.role === ROLES.CLIENT) {
    const ids = await ownProjectIds(session)
    where.projectId = { in: ids }
  } else {
    const projectId = searchParams.get('projectId')
    if (projectId) where.projectId = projectId
  }
  if (status) where.status = status

  const data = await prisma.cdeDocument.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
})

const POST = withAuth(async (req) => {
  const body = await req.json()
  const data = await prisma.cdeDocument.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}, ...STAFF)

export { GET, POST }