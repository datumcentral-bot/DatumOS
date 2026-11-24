import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES, projectScopeWhere } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors"

export const dynamic = "force-dynamic"

async function scopedProjectIds(session) {
  const projects = await prisma.project.findMany({
    where: projectScopeWhere(session),
    select: { id: true },
  })
  return projects.map((project) => project.id)
}

const GET = withAuth(async (req, _ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const where = {}
    if (session.user.role !== ROLES.DIRECTOR) {
      where.projectId = { in: await scopedProjectIds(session) }
    } else {
      const projectId = searchParams.get('projectId')
      if (projectId) where.projectId = projectId
    }
    const data = await prisma.bimMeeting.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req) }
}, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.CLIENT)

const POST = withAuth(async (req, _ctx, session) => {
  try {
    const body = await req.json()
    const { id, project, meetingDate, scheduledAt, location, ...rest } = body
    const projectId = rest.projectId || null
    if (session.user.role !== ROLES.DIRECTOR) {
      if (!projectId || !(await scopedProjectIds(session)).includes(projectId)) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
    }
    const rawDate = scheduledAt || meetingDate || rest.date || null
    rest.date = rawDate ? new Date(rawDate).toISOString() : null
    rest.projectId = projectId
    const data = await prisma.bimMeeting.create({ data: rest })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return errorResponse(e, req) }
}, ROLES.DIRECTOR, ROLES.MEMBER)

const PUT = withAuth(async (req, _ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { id: bodyId, project, meetingDate, projectId: requestedProjectId, ...rest } = body
    const targetId = id || bodyId
    if (!targetId) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (session.user.role !== ROLES.DIRECTOR) {
      const existing = await prisma.bimMeeting.findUnique({ where: { id: targetId }, select: { projectId: true } })
      if (!existing || !existing.projectId || !(await scopedProjectIds(session)).includes(existing.projectId)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
    } else if (requestedProjectId !== undefined) {
      rest.projectId = requestedProjectId || null
    }
    if (meetingDate !== undefined) rest.date = meetingDate ? new Date(meetingDate).toISOString() : null
    else if (rest.date) rest.date = new Date(rest.date).toISOString()
    const data = await prisma.bimMeeting.update({ where: { id: targetId }, data: rest })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req) }
}, ROLES.DIRECTOR, ROLES.MEMBER)

const DELETE = withAuth(async (req) => {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.bimMeeting.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return errorResponse(e, req) }
}, ROLES.DIRECTOR)

export { GET, POST, PUT, DELETE }
