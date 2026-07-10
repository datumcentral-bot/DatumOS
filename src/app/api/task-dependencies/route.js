import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const where = taskId ? { OR: [{ blockingTaskId: taskId }, { blockedTaskId: taskId }] } : {}
  const data = await prisma.taskDependency.findMany({ where, include: { blockingTask: { select: { title: true } }, blockedTask: { select: { title: true } } } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.taskDependency.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
