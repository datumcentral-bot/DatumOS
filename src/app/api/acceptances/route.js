import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES, getClientEntityId } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors";

// GET /api/acceptances?projectId= — DIRECTOR (all) | CLIENT (own project's)
const GET = withAuth(async (req, ctx, session) => {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = {}
  if (projectId) where.projectId = projectId
  if (session.user.role === ROLES.CLIENT) {
    const cid = getClientEntityId(session)
    if (!cid) return NextResponse.json([])
    where.project = { clientId: cid }
  }
  const data = await prisma.acceptance.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { id: true, name: true, code: true } } },
  })
  return NextResponse.json(data)
})

// POST /api/acceptances — DIRECTOR only
const POST = withAuth(async (req, ctx, session) => {
  const body = await req.json()
  const data = await prisma.acceptance.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}, ROLES.DIRECTOR)

// PUT /api/acceptances?id= — DIRECTOR only
const PUT = withAuth(async (req, ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const b = await req.json()
    const { id: bid, ...rest } = b
    const data = await prisma.acceptance.update({ where: { id: id || bid }, data: rest })
    return NextResponse.json(data)
  } catch (e) {
    return errorResponse(e, req)}
}, ROLES.DIRECTOR)

// DELETE /api/acceptances?id= — DIRECTOR only
const DELETE = withAuth(async (req, ctx, session) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.acceptance.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return errorResponse(e, req)}
}, ROLES.DIRECTOR)

export { GET, POST, PUT, DELETE }