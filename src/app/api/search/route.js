import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  if (!q || q.length < 2) return NextResponse.json({ clients: [], projects: [], tasks: [], meetings: [], cdeDocs: [] })
  const [clients, projects, tasks, meetings, cdeDocs] = await Promise.all([
    prisma.client.findMany({ where: { OR: [{ companyName: { contains: q } }, { contactName: { contains: q } }] }, take: 5, select: { id: true, companyName: true, industry: true } }),
    prisma.project.findMany({ where: { OR: [{ name: { contains: q } }, { code: { contains: q } }, { description: { contains: q } }] }, take: 5, select: { id: true, name: true, code: true, status: true } }),
    prisma.task.findMany({ where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] }, take: 5, select: { id: true, title: true, status: true, priority: true } }),
    prisma.meeting.findMany({ where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] }, take: 5, select: { id: true, title: true, scheduledAt: true, status: true } }),
    prisma.cdeDocument.findMany({ where: { OR: [{ name: { contains: q } }, { docCode: { contains: q } }] }, take: 5, select: { id: true, name: true, status: true, discipline: true } })
  ])
  return NextResponse.json({ clients, projects, tasks, meetings, cdeDocs })
}
