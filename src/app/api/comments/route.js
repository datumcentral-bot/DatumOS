import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, ROLES, getMemberEntityId, projectScopeWhere, taskScopeWhere } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors"

export const dynamic = "force-dynamic"

const GET = withAuth(async (req, ctx, session) => {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const projectId = searchParams.get('projectId')
  const meetingId = searchParams.get('meetingId')
  const where = {}
  if (taskId) where.taskId = taskId
  if (projectId) where.projectId = projectId
  if (meetingId) where.meetingId = meetingId

  if (session.user.role !== ROLES.DIRECTOR) {
    const projectScope = projectScopeWhere(session)
    const taskScope = taskScopeWhere(session)
    where.OR = [
      { project: projectScope },
      { task: { AND: [taskScope, { project: projectScope }] } },
      { meeting: { project: projectScope } },
    ]
  }
  const data = await prisma.comment.findMany({
    where,
    include: { author: { select: { name: true, avatarHue: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(data)
}, ROLES.DIRECTOR, ROLES.MEMBER, ROLES.CLIENT)

const POST = withAuth(async (req, ctx, session) => {
  const body = await req.json()
  const targets = [body.taskId, body.projectId, body.meetingId].filter(Boolean)
  if (targets.length !== 1) {
    return NextResponse.json({ error: 'Exactly one valid project, task, or meeting target is required' }, { status: 400 })
  }

  const role = session.user.role
  if (role !== ROLES.DIRECTOR && role !== ROLES.MEMBER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let target = null
  if (body.projectId) {
    target = await prisma.project.findFirst({
      where: { id: body.projectId, ...projectScopeWhere(session) },
      select: { id: true },
    })
  } else if (body.taskId) {
    target = await prisma.task.findFirst({
      where: {
        id: body.taskId,
        ...(role === ROLES.DIRECTOR ? {} : {
          AND: [
            taskScopeWhere(session),
            { project: projectScopeWhere(session) },
          ],
        }),
      },
      select: { id: true },
    })
  } else if (body.meetingId) {
    target = await prisma.meeting.findFirst({
      where: {
        id: body.meetingId,
        ...(role === ROLES.DIRECTOR ? {} : { project: projectScopeWhere(session) }),
      },
      select: { id: true },
    })
  }
  if (!target) return NextResponse.json({ error: 'Target not found or access denied' }, { status: 404 })

  const authorId = role === ROLES.MEMBER ? getMemberEntityId(session) : session.user.id
  if (!authorId) return NextResponse.json({ error: 'A linked user identity is required' }, { status: 403 })
  const data = await prisma.comment.create({
    data: {
      body: typeof body.body === 'string' ? body.body : '',
      authorId,
      taskId: body.taskId || null,
      projectId: body.projectId || null,
      meetingId: body.meetingId || null,
    },
    include: { author: { select: { name: true, avatarHue: true } } },
  })
  return NextResponse.json(data, { status: 201 })
}, ROLES.DIRECTOR, ROLES.MEMBER)

export { GET, POST }
