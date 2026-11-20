import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
  const where = {}
  const projectId = searchParams.get('projectId')
  if (projectId) where.projectId = projectId
    const data = await prisma.responsibilityMatrix.findMany({ where, orderBy: { createdAt: 'desc' }, include: { project: { select: { name: true } } } })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
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
    const data = await prisma.responsibilityMatrix.create({ data: body, include: { project: { select: { name: true } } } })
    return NextResponse.json(data, { status: 201 })
  } catch(e) { return errorResponse(e, req)}
}
export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const raw = await req.json()
    const { id, ...body } = raw
    for (const k of Object.keys(body)) {
      if (typeof body[k] === 'object' && body[k] !== null && !Array.isArray(body[k]) && !(body[k] instanceof Date)) {
        delete body[k]
      }
    }
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    const data = await prisma.responsibilityMatrix.update({ where: { id }, data: body, include: { project: { select: { name: true } } } })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.responsibilityMatrix.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return errorResponse(e, req)}
}
