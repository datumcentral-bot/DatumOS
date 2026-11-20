import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES } from "@/lib/auth"
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
async function _GET(req) {
  try {
    const { searchParams } = new URL(req.url)
  const where = {}
    const data = await prisma.sop.findMany({ where, orderBy: { title: 'desc' } })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
async function _POST(req) {
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
    const data = await prisma.sop.create({ data: body })
    return NextResponse.json(data, { status: 201 })
  } catch(e) { return errorResponse(e, req)}
}
async function _PUT(req) {
  try {
    const raw = await req.json()
    const { id, ...body } = raw
    for (const k of Object.keys(body)) {
      if (typeof body[k] === 'object' && body[k] !== null && !Array.isArray(body[k]) && !(body[k] instanceof Date)) {
        delete body[k]
      }
    }
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    const data = await prisma.sop.update({ where: { id }, data: body })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
async function _DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.sop.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return errorResponse(e, req)}
}

// ─────────────────────────────────────────────────────────────────────
// SECURITY (2026-10-10): this route had no in-handler authorisation.
// Verified before the fix: any authenticated session could read and write
// these records, including a CLIENT role. The edge middleware proved only
// that a session existed, never which records that session may touch.
// Allowed roles: DIRECTOR, MEMBER, REVIT. CLIENT users have their own scoped
// read-only portal endpoints and are intentionally excluded here.
// ─────────────────────────────────────────────────────────────────────
export const GET = withAuth(_GET, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
export const POST = withAuth(_POST, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
export const PUT = withAuth(_PUT, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
export const DELETE = withAuth(_DELETE, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.REVIT);
