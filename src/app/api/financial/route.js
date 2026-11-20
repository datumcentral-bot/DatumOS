import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES } from "@/lib/auth"
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

async function _GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.financialEntry.findMany({ where, include: { project: { select: { name: true, code: true } }, client: { select: { companyName: true } } }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}

async function _POST(req) {
  try {
    const body = await req.json()
    const { id, project, client, description, ...rest } = body
    if (!rest.title && description) rest.title = description;
    if (!rest.title) rest.title = 'Financial Entry';
    if (rest.projectId === '') rest.projectId = null
    if (rest.clientId === '') rest.clientId = null
    if (rest.dueDate === '') rest.dueDate = null
    if (rest.paidDate === '') rest.paidDate = null
    if (rest.amount) rest.amount = parseFloat(rest.amount) || 0
    const data = await prisma.financialEntry.create({ data: rest })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return errorResponse(e, req)}
}

async function _PUT(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { id: bodyId, project, client, description, ...rest } = body
    if (!rest.title && description) rest.title = description;
    if (rest.projectId === '') rest.projectId = null
    if (rest.clientId === '') rest.clientId = null
    if (rest.dueDate === '') rest.dueDate = null
    if (rest.paidDate === '') rest.paidDate = null
    if (rest.amount) rest.amount = parseFloat(rest.amount) || 0
    const data = await prisma.financialEntry.update({ where: { id: id || bodyId }, data: rest })
    return NextResponse.json(data)
  } catch (e) { return errorResponse(e, req)}
}

async function _DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.financialEntry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return errorResponse(e, req)}
}

// ─────────────────────────────────────────────────────────────────────
// SECURITY (2026-10-10): this route had no in-handler authorisation.
// Verified before the fix: any authenticated session could read and write
// these records, including a CLIENT role. The edge middleware proved only
// that a session existed, never which records that session may touch.
// Allowed roles: DIRECTOR. CLIENT users have their own scoped
// read-only portal endpoints and are intentionally excluded here.
// ─────────────────────────────────────────────────────────────────────
export const GET = withAuth(_GET, ROLES.DIRECTOR);
export const POST = withAuth(_POST, ROLES.DIRECTOR);
export const PUT = withAuth(_PUT, ROLES.DIRECTOR);
export const DELETE = withAuth(_DELETE, ROLES.DIRECTOR);
