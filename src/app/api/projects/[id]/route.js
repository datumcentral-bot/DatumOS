import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.project.findUnique({ where: { id: params.id }, include: { client: true, assignments: { include: { user: { select: { name: true, title: true, avatarHue: true } } } }, tasks: { include: { assignee: { select: { name: true } } }, orderBy: { orderIndex: 'asc' } }, milestones: { orderBy: { dueDate: 'asc' } }, deliverables: true, projectFiles: { orderBy: { uploadedAt: 'desc' } }, beps: true, midps: { include: { deliverables: true } }, eirs: { include: { sections: true } }, airs: { include: { sections: true } }, cdeDocs: { orderBy: { createdAt: 'desc' } }, clashDetections: { orderBy: { createdAt: 'desc' } }, _count: { select: { tasks: true, milestones: true, cdeDocs: true, clashDetections: true, risks: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { assignments, divisions, tasks, milestones, deliverables, projectFiles, beps, midps, eirs, airs, cdeDocs, clashDetections, client, ...rest } = body
  const data = await prisma.project.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
