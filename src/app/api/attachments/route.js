import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const projectId = searchParams.get('projectId')
  const where = {}
  if (taskId) where.taskId = taskId
  if (projectId) where.projectId = projectId
  const data = await prisma.attachment.findMany({ where, orderBy: { uploadedAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.attachment.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
