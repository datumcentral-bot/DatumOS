import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES, getClientEntityId, projectScopeWhere } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors";

// SECURITY FIX (2026-10-10): this is the endpoint the CLIENT PORTAL itself
// calls, and it had no in-handler authorisation and no tenant scoping.
//
// Verified defect before this fix, using two real synthetic CLIENT sessions
// linked to two different client records:
//
//   * GET /api/client-projects returned EVERY project in the database.
//     Client A received 8 projects, of which 6 belonged to other clients —
//     including other clients' project names, codes, files and deliverables.
//   * A caller-supplied ?clientId= let a client request any tenant by id.
//   * POST allowed any authenticated role, including CLIENT, to create a
//     project against any client.
//   * PUT accepted any project id, so a client could rewrite another
//     client's project. The body also spread `clientId`, so ownership could
//     be reassigned outright.
//   * DELETE removed any project by id, for any role.
//
// Scope of this fix: authenticate every method, scope reads to the session's
// own client, restrict writes to staff, and block ownership reassignment.

export const dynamic = "force-dynamic";

const STAFF = [ROLES.DIRECTOR, ROLES.MEMBER]

/** The clientId a session is allowed to see, or null for staff. */
function ownClientId(session) {
  if (session?.user?.role !== ROLES.CLIENT) return null
  return getClientEntityId(session) || '__NONE__'
}

const GET = withAuth(async (req, _ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const where = { ...projectScopeWhere(session) }
    const own = ownClientId(session)

    if (own) {
      // A client is pinned to its own records. A supplied clientId is ignored,
      // so it cannot be used to select another tenant.
      where.clientId = own
    } else if (session?.user?.role === ROLES.DIRECTOR) {
      // Only Directors may browse or filter the complete client portfolio.
      const clientId = searchParams.get('clientId')
      if (clientId) where.clientId = clientId
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true, country: true } },
        projectFiles: true,
        deliverables: true,
        _count: { select: { tasks: true, risks: true } }
      },
    })
    return NextResponse.json(projects)
  } catch (e) {
    return errorResponse(e, req)}
})

const POST = withAuth(async (req) => {
  try {
    const b = await req.json()
    const { files, deliverables, subAssignments, bep, eirAir, progress, isoStatus, projectType, stage, scopeSummary, requirements, health, ...rest } = b
    const project = await prisma.project.create({
      data: {
        ...rest,
        progressPct: progress ? parseInt(progress) : 0,
        isoStage: isoStatus || null,
        phase: stage || null,
        description: scopeSummary || rest.description || null,
        healthScore: health === 'GREEN' ? 90 : health === 'AMBER' ? 60 : health === 'RED' ? 30 : 75,
      },
      include: { client: { select: { id: true, companyName: true } } }
    })
    return NextResponse.json(project, { status: 201 })
  } catch (e) {
    return errorResponse(e, req)}
}, ...STAFF)

const PUT = withAuth(async (req, _ctx, session) => {
  try {
    const b = await req.json()
    const { id, files, deliverables, subAssignments, bep, eirAir, progress, isoStatus, projectType, stage, scopeSummary, requirements, health, ...rest } = b

    if (!id) return NextResponse.json({ error: 'Project id is required.' }, { status: 400 })

    // Members may update only projects assigned to their linked team identity.
    const allowed = await prisma.project.findFirst({
      where: { AND: [{ id }, projectScopeWhere(session)] },
      select: { id: true }
    })
    if (!allowed) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // `clientId` is stripped from the update so ownership cannot be reassigned.
    const { clientId: _ignoredClientId, ...safeRest } = rest

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...safeRest,
        progressPct: progress ? parseInt(progress) : undefined,
        isoStage: isoStatus || undefined,
        phase: stage || undefined,
        description: scopeSummary || rest.description || undefined,
        healthScore: health === 'GREEN' ? 90 : health === 'AMBER' ? 60 : health === 'RED' ? 30 : undefined,
      }
    })
    return NextResponse.json(project)
  } catch (e) {
    return errorResponse(e, req)}
}, ...STAFF)

const DELETE = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Project id is required.' }, { status: 400 })
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return errorResponse(e, req)}
}, ROLES.DIRECTOR)

export { GET, POST, PUT, DELETE }