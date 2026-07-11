import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcast } from '@/lib/broadcast'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const assigneeId = searchParams.get('assigneeId')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const where = {}
  if (projectId) where.projectId = projectId
  if (assigneeId) where.assigneeId = assigneeId
  if (status) where.status = status
  if (priority) where.priority = priority
  try {
    const data = await prisma.task.findMany({ where, include: { assignee: { select: { name: true, avatarHue: true } }, project: { select: { name: true, code: true } }, subtasks: { select: { id: true, title: true, status: true } }, _count: { select: { comments: true, attachments: true, timeEntries: true, subtasks: true } } }, orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }] })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { assignee, project, subtasks, comments, attachments, timeEntries, blockingDeps, blockedByDeps, _count, ...rest } = body
    if (rest.projectId === '') rest.projectId = null
    if (rest.assigneeId === '') rest.assigneeId = null
    if (rest.parentId === '') rest.parentId = null
    if (rest.estimatedHrs) rest.estimatedHrs = parseFloat(rest.estimatedHrs) || null
    const data = await prisma.task.create({ data: rest, include: { assignee: { select: { name: true } }, project: { select: { name: true } } } })
    broadcast('tasks', 'created', data, 'Director')
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function PUT(req) {
  try {
    const body = await req.json()
    const { id, assignee, project, subtasks, comments, attachments, timeEntries, blockingDeps, blockedByDeps, _count, ...rest } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (rest.projectId === '') rest.projectId = null
    if (rest.assigneeId === '') rest.assigneeId = null
    if (rest.estimatedHrs) rest.estimatedHrs = parseFloat(rest.estimatedHrs) || null
    const data = await prisma.task.update({ where: { id }, data: rest, include: { assignee: { select: { name: true } }, project: { select: { name: true } } } })
    const action = rest.status ? 'updated' : 'moved'
    broadcast('tasks', action, data, 'Director')
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.task.delete({ where: { id } })
    broadcast('tasks', 'deleted', { id }, 'Director')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
