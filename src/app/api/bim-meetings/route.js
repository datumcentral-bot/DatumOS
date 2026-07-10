import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.bimMeeting.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { id, project, meetingDate, scheduledAt, location, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    // Convert date string to proper DateTime — accept scheduledAt, meetingDate, or date
    const rawDate = scheduledAt || meetingDate || rest.date || null;
    if (rawDate) {
      rest.date = new Date(rawDate).toISOString();
    } else {
      rest.date = null;
    }
    const data = await prisma.bimMeeting.create({ data: rest })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { id: bodyId, project, meetingDate, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    const data = await prisma.bimMeeting.update({ where: { id: id || bodyId }, data: { ...rest, date: meetingDate || rest.date || null } })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.bimMeeting.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}