import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors";

// DN019 hardening: clash detail reads/writes are DIRECTOR-only.

export const GET = withAuth(async (req, { params }) => {
  try {
    const data = await prisma.clashDetection.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } } } })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}, ROLES.DIRECTOR)

export const PUT = withAuth(async (req, { params }) => {
  try {
    const raw = await req.json()
    const { id, ...body } = raw
    // strip relation objects
    for (const k of Object.keys(body)) {
      if (typeof body[k] === 'object' && body[k] !== null && !Array.isArray(body[k]) && !(body[k] instanceof Date)) {
        delete body[k]
      }
    }
    // empty string → null
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.detectedAt) body.detectedAt = new Date(body.detectedAt);
    if (body.resolvedAt) body.resolvedAt = new Date(body.resolvedAt);
    const data = await prisma.clashDetection.update({ where: { id: params.id }, data: body, include: { project: { select: { name: true } } } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}, ROLES.DIRECTOR)

export const DELETE = withAuth(async (req, { params }) => {
  try {
    await prisma.clashDetection.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return errorResponse(e, req)}
}, ROLES.DIRECTOR)