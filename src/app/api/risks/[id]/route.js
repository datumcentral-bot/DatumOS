import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const data = await prisma.risk.findUnique({ where: { id: params.id } })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function PUT(req, { params }) {
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
    if (body.reviewDate) body.reviewDate = new Date(body.reviewDate);
    const data = await prisma.risk.update({ where: { id: params.id }, data: body })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function DELETE(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    await prisma.risk.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return errorResponse(e, req)}
}
