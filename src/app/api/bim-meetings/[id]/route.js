import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard, getSession, ROLES, projectScopeWhere } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors"

export const dynamic = "force-dynamic"

async function canAccessMeeting(session, id) {
  if (session?.user?.role === ROLES.DIRECTOR) return true
  const meeting = await prisma.bimMeeting.findUnique({ where: { id }, select: { projectId: true } })
  if (!meeting?.projectId) return false
  const project = await prisma.project.findFirst({
    where: { id: meeting.projectId, ...projectScopeWhere(session) },
    select: { id: true },
  })
  return Boolean(project)
}

export async function GET(req, { params }) {
  const denied = await guard(ROLES.DIRECTOR, ROLES.MEMBER, ROLES.CLIENT)
  if (denied) return denied
  try {
    const session = await getSession()
    if (!(await canAccessMeeting(session, params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = await prisma.bimMeeting.findUnique({ where: { id: params.id } })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req) }
}

export async function PUT(req, { params }) {
  const denied = await guard(ROLES.DIRECTOR, ROLES.MEMBER)
  if (denied) return denied
  try {
    const session = await getSession()
    if (!(await canAccessMeeting(session, params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const raw = await req.json()
    const { id, projectId, ...body } = raw
    for (const key of Object.keys(body)) {
      if (typeof body[key] === 'object' && body[key] !== null && !Array.isArray(body[key]) && !(body[key] instanceof Date)) delete body[key]
    }
    for (const key of Object.keys(body)) if (body[key] === '') body[key] = null
    if (body.date) body.date = new Date(body.date)
    const data = await prisma.bimMeeting.update({ where: { id: params.id }, data: {
      ...body,
      ...(session.user.role === ROLES.DIRECTOR && projectId !== undefined ? { projectId: projectId || null } : {}),
    } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req) }
}

export async function DELETE(req, { params }) {
  const denied = await guard(ROLES.DIRECTOR)
  if (denied) return denied
  try {
    await prisma.bimMeeting.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return errorResponse(e, req) }
}
