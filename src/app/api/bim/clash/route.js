import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcast } from '@/lib/broadcast'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = {}
    if (projectId) where.projectId = projectId
    const data = await prisma.clashDetection.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  try {
    const raw = await req.json()
    const { id, project, ...body } = raw
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.detectedAt) body.detectedAt = new Date(body.detectedAt)
    if (body.resolvedAt) body.resolvedAt = new Date(body.resolvedAt)
    const data = await prisma.clashDetection.create({ data: body })
    broadcast('clash', 'created', data, 'BIM Coordinator')
    return NextResponse.json(data, { status: 201 })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PUT(req) {
  try {
    const raw = await req.json()
    const { id, project, ...body } = raw
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.detectedAt) body.detectedAt = new Date(body.detectedAt)
    if (body.resolvedAt) body.resolvedAt = new Date(body.resolvedAt)
    const data = await prisma.clashDetection.update({ where: { id }, data: body })
    const action = body.status === 'RESOLVED' ? 'resolved' : 'updated'
    broadcast('clash', action, data, 'BIM Coordinator')
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.clashDetection.delete({ where: { id } })
    broadcast('clash', 'deleted', { id }, 'BIM Coordinator')
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
