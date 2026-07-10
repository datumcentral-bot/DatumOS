import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId') || searchParams.get('clientProjectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.projectFile.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { clientProjectId, ...rest } = body
  const data = await prisma.projectFile.create({ data: { ...rest, projectId: rest.projectId || clientProjectId || null } })
  return NextResponse.json(data, { status: 201 })
}
export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await prisma.projectFile.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
