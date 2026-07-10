import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.coordinationItem.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function POST(req) {
  try {
    const raw = await req.json()
    const { id, project, ...body } = raw
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.dueDate) body.dueDate = new Date(body.dueDate)
    const data = await prisma.coordinationItem.create({ data: body })
    return NextResponse.json(data, { status: 201 })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function PUT(req) {
  try {
    const raw = await req.json()
    const { id, project, ...body } = raw
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.dueDate) body.dueDate = new Date(body.dueDate)
    const data = await prisma.coordinationItem.update({ where: { id }, data: body })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.coordinationItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
