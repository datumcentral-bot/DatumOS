import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES, getClientEntityId, projectScopeWhere } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors";

// GET /api/digital-twins?projectId= — Director all; Member assigned projects; Client own projects.
const GET = withAuth(async (req, ctx, session) => {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = {}
  if (projectId) where.projectId = projectId
  if (session.user.role !== ROLES.DIRECTOR) {
    where.project = projectScopeWhere(session)
  }
  const data = await prisma.digitalTwin.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { id: true, name: true, code: true } } },
  })
  return NextResponse.json(data)
}, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.CLIENT)

// POST /api/digital-twins — DIRECTOR only
const POST = withAuth(async (req, ctx, session) => {
  const body = await req.json()
  const data = await prisma.digitalTwin.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}, ROLES.DIRECTOR)

// PUT /api/digital-twins?id= — DIRECTOR only
const PUT = withAuth(async (req, ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const b = await req.json()
    const { id: bid, ...rest } = b
    const data = await prisma.digitalTwin.update({ where: { id: id || bid }, data: rest })
    return NextResponse.json(data)
  } catch (e) {
    return errorResponse(e, req)
  }
}, ROLES.DIRECTOR)

// DELETE /api/digital-twins?id= — DIRECTOR only
const DELETE = withAuth(async (req, ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.digitalTwin.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return errorResponse(e, req)
  }
}, ROLES.DIRECTOR)

export { GET, POST, PUT, DELETE }
