import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  try {
    const data = await prisma.task.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } }, assignee: { select: { name: true } } } })
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
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.startDate) body.startDate = new Date(body.startDate);
    const data = await prisma.task.update({ where: { id: params.id }, data: body, include: { project: { select: { name: true } }, assignee: { select: { name: true } } } })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function DELETE(req, { params }) {
  try {
    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
