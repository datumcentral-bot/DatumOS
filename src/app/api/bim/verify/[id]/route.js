import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  try {
    const data = await prisma.bimVerifyCheck.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } } } })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function PUT(req, { params }) {
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
    if (body.checkedAt) body.checkedAt = new Date(body.checkedAt);
    const data = await prisma.bimVerifyCheck.update({ where: { id: params.id }, data: body, include: { project: { select: { name: true } } } })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function DELETE(req, { params }) {
  try {
    await prisma.bimVerifyCheck.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
