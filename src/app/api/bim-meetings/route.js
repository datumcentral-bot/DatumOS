import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES, getClientEntityId } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors";

// SECURITY (2026-10-10): the client portal reads meetings from this route. It
// had no in-handler authorisation and no tenant scoping, so any authenticated
// session - including a CLIENT - could list every BIM meeting by omitting
// ?projectId.
//
// A CLIENT is now pinned to its own client's projects and cannot widen that with
// a query parameter. Writes are staff-only.
export const dynamic = "force-dynamic";

const STAFF = [ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT]

async function ownProjectIds(session) {
  const clientId = getClientEntityId(session)
  if (!clientId) return []
  const rows = await prisma.project.findMany({ where: { clientId }, select: { id: true } })
  return rows.map((r) => r.id)
}

const GET = withAuth(async (req, _ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const where = {}
    if (session?.user?.role === ROLES.CLIENT) {
      where.projectId = { in: await ownProjectIds(session) }
    } else {
      const projectId = searchParams.get('projectId')
      if (projectId) where.projectId = projectId
    }
    const data = await prisma.bimMeeting.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
})

const POST = withAuth(async (req) => {
  try {
    const body = await req.json()
    const { id, project, meetingDate, scheduledAt, location, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    const rawDate = scheduledAt || meetingDate || rest.date || null;
    if (rawDate) {
      rest.date = new Date(rawDate).toISOString();
    } else {
      rest.date = null;
    }
    const data = await prisma.bimMeeting.create({ data: rest })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return errorResponse(e, req)}
}, ...STAFF)

const PUT = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { id: bodyId, project, meetingDate, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    const data = await prisma.bimMeeting.update({ where: { id: id || bodyId }, data: { ...rest, date: meetingDate || rest.date || null } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}, ...STAFF)

const DELETE = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.bimMeeting.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return errorResponse(e, req)}
}, ROLES.DIRECTOR)

export { GET, POST, PUT, DELETE }