import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.lodSpec.findMany({ where, include: { project: { select: { name: true, code: true } } }, orderBy: { element: 'asc' } })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { id, project, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    const data = await prisma.lodSpec.create({ data: rest })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { id: bodyId, project, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    const data = await prisma.lodSpec.update({ where: { id: id || bodyId }, data: rest })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.lodSpec.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
