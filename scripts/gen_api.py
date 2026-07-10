#!/usr/bin/env python3
"""Generate all v13 API route files"""
import os

BASE = '/workspace/datumos_v13/src/app/api'

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f'  ✓ {path.replace(BASE, "")}')

# ─── BIM/BEP ─────────────────────────────────────────────────────────────────
write(f'{BASE}/bim/bep/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.bep.findMany({ where, include: { project: { select: { name: true, code: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.bep.create({ data: body, include: { project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/bep/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.bep.findUnique({ where: { id: params.id }, include: { project: { select: { name: true, code: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.bep.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.bep.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/MIDP ────────────────────────────────────────────────────────────────
write(f'{BASE}/bim/midp/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.midp.findMany({ where, include: { project: { select: { name: true } }, deliverables: true, tidps: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { deliverables, ...rest } = body
  const data = await prisma.midp.create({ data: { ...rest, deliverables: deliverables ? { create: deliverables } : undefined }, include: { deliverables: true } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/midp/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.midp.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } }, deliverables: true, tidps: { include: { items: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { deliverables, tidps, ...rest } = body
  const data = await prisma.midp.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.midp.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/TIDP ────────────────────────────────────────────────────────────────
write(f'{BASE}/bim/tidp/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const midpId = searchParams.get('midpId')
  const where = {}
  if (projectId) where.projectId = projectId
  if (midpId) where.midpId = midpId
  const data = await prisma.tidp.findMany({ where, include: { project: { select: { name: true } }, midp: { select: { title: true } }, items: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { items, ...rest } = body
  const data = await prisma.tidp.create({ data: { ...rest, items: items ? { create: items } : undefined }, include: { items: true } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/tidp/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.tidp.findUnique({ where: { id: params.id }, include: { items: true, project: { select: { name: true } }, midp: { select: { title: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { items, ...rest } = body
  const data = await prisma.tidp.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.tidp.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/EIR ─────────────────────────────────────────────────────────────────
write(f'{BASE}/bim/eir/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.eir.findMany({ where, include: { project: { select: { name: true } }, sections: { orderBy: { orderIndex: 'asc' } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { sections, ...rest } = body
  const data = await prisma.eir.create({ data: { ...rest, sections: sections ? { create: sections } : undefined }, include: { sections: true } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/eir/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.eir.findUnique({ where: { id: params.id }, include: { sections: { orderBy: { orderIndex: 'asc' } }, project: { select: { name: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { sections, ...rest } = body
  const data = await prisma.eir.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.eir.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/AIR ─────────────────────────────────────────────────────────────────
write(f'{BASE}/bim/air/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.air.findMany({ where, include: { project: { select: { name: true } }, sections: { orderBy: { orderIndex: 'asc' } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { sections, ...rest } = body
  const data = await prisma.air.create({ data: { ...rest, sections: sections ? { create: sections } : undefined }, include: { sections: true } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/air/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.air.findUnique({ where: { id: params.id }, include: { sections: { orderBy: { orderIndex: 'asc' } }, project: { select: { name: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { sections, ...rest } = body
  const data = await prisma.air.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.air.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/CDE ─────────────────────────────────────────────────────────────────
write(f'{BASE}/bim/cde/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const where = {}
  if (projectId) where.projectId = projectId
  if (status) where.status = status
  const data = await prisma.cdeDocument.findMany({ where, include: { project: { select: { name: true, code: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.cdeDocument.create({ data: body, include: { project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/cde/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.cdeDocument.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.cdeDocument.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.cdeDocument.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/LOD ─────────────────────────────────────────────────────────────────
write(f'{BASE}/bim/lod/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.lodSpec.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { element: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.lodSpec.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/lod/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.lodSpec.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.lodSpec.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/CLASH ───────────────────────────────────────────────────────────────
write(f'{BASE}/bim/clash/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const where = {}
  if (projectId) where.projectId = projectId
  if (status) where.status = status
  const data = await prisma.clashDetection.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.clashDetection.create({ data: body, include: { project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/clash/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.clashDetection.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.clashDetection.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/RESPONSIBILITY-MATRIX ───────────────────────────────────────────────
write(f'{BASE}/bim/responsibility-matrix/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.responsibilityMatrix.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { discipline: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.responsibilityMatrix.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/responsibility-matrix/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.responsibilityMatrix.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.responsibilityMatrix.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── BIM/NAMING-CONVENTION ───────────────────────────────────────────────────
write(f'{BASE}/bim/naming-convention/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.namingConvention.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.namingConvention.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/bim/naming-convention/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.namingConvention.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.namingConvention.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── COMMENTS ────────────────────────────────────────────────────────────────
write(f'{BASE}/comments/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const projectId = searchParams.get('projectId')
  const meetingId = searchParams.get('meetingId')
  const where = {}
  if (taskId) where.taskId = taskId
  if (projectId) where.projectId = projectId
  if (meetingId) where.meetingId = meetingId
  const data = await prisma.comment.findMany({ where, include: { author: { select: { name: true, avatarHue: true } } }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.comment.create({ data: body, include: { author: { select: { name: true, avatarHue: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/comments/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.comment.update({ where: { id: params.id }, data: { body: body.body } })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.comment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ATTACHMENTS ─────────────────────────────────────────────────────────────
write(f'{BASE}/attachments/route.js', '''import { NextResponse } from 'next/server'
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
''')

write(f'{BASE}/attachments/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function DELETE(req, { params }) {
  await prisma.attachment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── TIME ENTRIES ─────────────────────────────────────────────────────────────
write(f'{BASE}/time-entries/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const userId = searchParams.get('userId')
  const where = {}
  if (taskId) where.taskId = taskId
  if (userId) where.userId = userId
  const data = await prisma.timeEntry.findMany({ where, include: { user: { select: { name: true } }, task: { select: { title: true } } }, orderBy: { startedAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.timeEntry.create({ data: body, include: { user: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/time-entries/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.timeEntry.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.timeEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── SUBTASKS ─────────────────────────────────────────────────────────────────
write(f'{BASE}/subtasks/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const parentId = searchParams.get('parentId')
  const where = parentId ? { parentId } : { parentId: { not: null } }
  const data = await prisma.task.findMany({ where, include: { assignee: { select: { name: true } } }, orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.task.create({ data: body, include: { assignee: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

# ─── TASK DEPENDENCIES ────────────────────────────────────────────────────────
write(f'{BASE}/task-dependencies/route.js', '''import { NextResponse } from 'next/server'
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
''')

write(f'{BASE}/task-dependencies/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function DELETE(req, { params }) {
  await prisma.taskDependency.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── TAGS ─────────────────────────────────────────────────────────────────────
write(f'{BASE}/tags/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const data = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.tag.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/tags/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.tag.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.tag.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── SAVED VIEWS ──────────────────────────────────────────────────────────────
write(f'{BASE}/saved-views/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const module = searchParams.get('module')
  const where = {}
  if (userId) where.userId = userId
  if (module) where.module = module
  const data = await prisma.savedView.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.savedView.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/saved-views/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function DELETE(req, { params }) {
  await prisma.savedView.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── MEETING PARTICIPANTS ─────────────────────────────────────────────────────
write(f'{BASE}/meeting-participants/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const meetingId = searchParams.get('meetingId')
  const where = meetingId ? { meetingId } : {}
  const data = await prisma.meetingParticipant.findMany({ where, include: { user: { select: { name: true, email: true } } } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.meetingParticipant.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/meeting-participants/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.meetingParticipant.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.meetingParticipant.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── MEETING MINUTES ──────────────────────────────────────────────────────────
write(f'{BASE}/meeting-minutes/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const meetingId = searchParams.get('meetingId')
  const where = meetingId ? { meetingId } : {}
  const data = await prisma.meetingMinute.findMany({ where, orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.meetingMinute.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/meeting-minutes/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.meetingMinute.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.meetingMinute.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ACTION ITEMS ─────────────────────────────────────────────────────────────
write(f'{BASE}/action-items/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const meetingId = searchParams.get('meetingId')
  const where = meetingId ? { meetingId } : {}
  const data = await prisma.actionItem.findMany({ where, include: { assignee: { select: { name: true } } }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.actionItem.create({ data: body, include: { assignee: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/action-items/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.actionItem.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.actionItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
write(f'{BASE}/search/route.js', '''import { NextResponse } from 'next/server'
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
''')

# ─── WORKLOAD ─────────────────────────────────────────────────────────────────
write(f'{BASE}/workload/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const weekStart = searchParams.get('weekStart')
  const where = weekStart ? { weekStart: new Date(weekStart) } : {}
  const allocations = await prisma.resourceAllocation.findMany({ where, include: { user: { select: { name: true, capacityHrs: true, avatarHue: true } }, project: { select: { name: true, code: true } } } })
  const users = await prisma.user.findMany({ where: { active: true, role: { not: 'CLIENT' } }, select: { id: true, name: true, capacityHrs: true, avatarHue: true, title: true } })
  return NextResponse.json({ allocations, users })
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.resourceAllocation.create({ data: { ...body, weekStart: new Date(body.weekStart) } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/workload/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.resourceAllocation.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.resourceAllocation.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED MEETINGS ────────────────────────────────────────────────────────
write(f'{BASE}/meetings/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const where = {}
  if (projectId) where.projectId = projectId
  if (status) where.status = status
  const data = await prisma.meeting.findMany({ where, include: { project: { select: { name: true } }, participants: { include: { user: { select: { name: true } } } }, _count: { select: { actionItems: true, minutes: true } } }, orderBy: { scheduledAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { participants, ...rest } = body
  const data = await prisma.meeting.create({ data: { ...rest, participants: participants ? { create: participants } : undefined }, include: { participants: true, project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/meetings/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.meeting.findUnique({ where: { id: params.id }, include: { project: { select: { name: true } }, participants: { include: { user: { select: { name: true, email: true } } } }, minutes: { orderBy: { orderIndex: 'asc' } }, actionItems: { include: { assignee: { select: { name: true } } } }, comments: { include: { author: { select: { name: true } } } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { participants, minutes, actionItems, comments, ...rest } = body
  const data = await prisma.meeting.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.meeting.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED CLIENTS ─────────────────────────────────────────────────────────
write(f'{BASE}/clients/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where = status ? { status } : {}
  const data = await prisma.client.findMany({ where, include: { _count: { select: { projects: true, requirements: true, assessments: true } }, contacts: true }, orderBy: { companyName: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { contacts, requirements, assessments, ...rest } = body
  const data = await prisma.client.create({ data: { ...rest, contacts: contacts ? { create: contacts } : undefined, requirements: requirements ? { create: requirements } : undefined }, include: { contacts: true, _count: { select: { projects: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/clients/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.client.findUnique({ where: { id: params.id }, include: { projects: { select: { id: true, name: true, status: true, progressPct: true } }, requirements: true, assessments: true, documents: true, contacts: true, invoices: { select: { id: true, invoiceNo: true, amount: true, status: true } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { contacts, requirements, assessments, documents, projects, invoices, leads, portalUsers, ...rest } = body
  const data = await prisma.client.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.client.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── CLIENT REQUIREMENTS ──────────────────────────────────────────────────────
write(f'{BASE}/clients/[id]/requirements/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.clientRequirement.findMany({ where: { clientId: params.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req, { params }) {
  const body = await req.json()
  const data = await prisma.clientRequirement.create({ data: { ...body, clientId: params.id } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/clients/[id]/requirements/[reqId]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.clientRequirement.update({ where: { id: params.reqId }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.clientRequirement.delete({ where: { id: params.reqId } })
  return NextResponse.json({ ok: true })
}
''')

# ─── CLIENT ASSESSMENTS ───────────────────────────────────────────────────────
write(f'{BASE}/clients/[id]/assessments/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.clientAssessment.findMany({ where: { clientId: params.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req, { params }) {
  const body = await req.json()
  const data = await prisma.clientAssessment.create({ data: { ...body, clientId: params.id } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/clients/[id]/assessments/[aId]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.clientAssessment.update({ where: { id: params.aId }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.clientAssessment.delete({ where: { id: params.aId } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED PROJECTS ────────────────────────────────────────────────────────
write(f'{BASE}/projects/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')
  const where = {}
  if (clientId) where.clientId = clientId
  if (status) where.status = status
  const data = await prisma.project.findMany({ where, include: { client: { select: { companyName: true } }, assignments: { include: { user: { select: { name: true, avatarHue: true } } } }, _count: { select: { tasks: true, milestones: true, cdeDocs: true, clashDetections: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { assignments, divisions, ...rest } = body
  const data = await prisma.project.create({ data: { ...rest, assignments: assignments ? { create: assignments } : undefined, divisions: divisions ? { create: divisions } : undefined }, include: { client: { select: { companyName: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/projects/[id]/route.js', '''import { NextResponse } from 'next/server'
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
''')

# ─── ENHANCED TASKS ───────────────────────────────────────────────────────────
write(f'{BASE}/pm-tasks/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const assigneeId = searchParams.get('assigneeId')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const isTemplate = searchParams.get('isTemplate')
  const parentId = searchParams.get('parentId')
  const where = {}
  if (projectId) where.projectId = projectId
  if (assigneeId) where.assigneeId = assigneeId
  if (status) where.status = status
  if (priority) where.priority = priority
  if (isTemplate !== null && isTemplate !== undefined) where.isTemplate = isTemplate === 'true'
  if (parentId === 'null') where.parentId = null
  else if (parentId) where.parentId = parentId
  const data = await prisma.task.findMany({ where, include: { assignee: { select: { name: true, avatarHue: true } }, project: { select: { name: true, code: true } }, subtasks: { select: { id: true, title: true, status: true } }, _count: { select: { comments: true, attachments: true, timeEntries: true, subtasks: true } } }, orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.task.create({ data: body, include: { assignee: { select: { name: true } }, project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/pm-tasks/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.task.findUnique({ where: { id: params.id }, include: { assignee: { select: { name: true, avatarHue: true } }, project: { select: { name: true, code: true } }, subtasks: { include: { assignee: { select: { name: true } } } }, comments: { include: { author: { select: { name: true, avatarHue: true } } }, orderBy: { createdAt: 'asc' } }, attachments: true, timeEntries: { include: { user: { select: { name: true } } }, orderBy: { startedAt: 'desc' } }, blockingDeps: { include: { blockedTask: { select: { title: true, status: true } } } }, blockedByDeps: { include: { blockingTask: { select: { title: true, status: true } } } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { assignee, project, subtasks, comments, attachments, timeEntries, blockingDeps, blockedByDeps, ...rest } = body
  const data = await prisma.task.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED LEADS ───────────────────────────────────────────────────────────
write(f'{BASE}/leads/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const where = stage ? { stage } : {}
  const data = await prisma.lead.findMany({ where, orderBy: [{ stage: 'asc' }, { orderIndex: 'asc' }] })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.lead.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/leads/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.lead.findUnique({ where: { id: params.id } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.lead.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.lead.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── LEADS CONVERT ────────────────────────────────────────────────────────────
write(f'{BASE}/leads/[id]/convert/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function POST(req, { params }) {
  const lead = await prisma.lead.findUnique({ where: { id: params.id } })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  const client = await prisma.client.create({ data: { companyName: lead.company, contactName: lead.contactName, contactEmail: lead.contactEmail || '', contactPhone: lead.contactPhone, country: lead.country || 'UAE', status: 'ACTIVE', notes: lead.notes } })
  await prisma.lead.update({ where: { id: params.id }, data: { stage: 'WON', convertedToClientId: client.id } })
  return NextResponse.json({ client, message: 'Lead converted to client' })
}
''')

# ─── ENHANCED INVOICES ────────────────────────────────────────────────────────
write(f'{BASE}/invoices/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const where = {}
  if (clientId) where.clientId = clientId
  if (projectId) where.projectId = projectId
  if (status) where.status = status
  const data = await prisma.invoice.findMany({ where, include: { client: { select: { companyName: true } }, project: { select: { name: true, code: true } } }, orderBy: { issueDate: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.invoice.create({ data: body, include: { client: { select: { companyName: true } }, project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/invoices/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const { client, project, ...rest } = body
  const data = await prisma.invoice.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.invoice.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED TEAM ────────────────────────────────────────────────────────────
write(f'{BASE}/team/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const where = { role: { not: 'CLIENT' } }
  if (role) where.role = role
  const data = await prisma.user.findMany({ where, include: { _count: { select: { tasks: true, assignments: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json(data.map(u => ({ ...u, password: undefined })))
}
export async function POST(req) {
  const body = await req.json()
  const { password, ...rest } = body
  const hashed = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('Member@2026!', 10)
  const data = await prisma.user.create({ data: { ...rest, password: hashed } })
  return NextResponse.json({ ...data, password: undefined }, { status: 201 })
}
''')

write(f'{BASE}/team/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.user.findUnique({ where: { id: params.id }, include: { tasks: { select: { id: true, title: true, status: true, priority: true } }, assignments: { include: { project: { select: { name: true } } } }, resourceAllocations: { orderBy: { weekStart: 'desc' }, take: 8 } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...data, password: undefined })
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { password, tasks, assignments, resourceAllocations, ...rest } = body
  const data = await prisma.user.update({ where: { id: params.id }, data: rest })
  return NextResponse.json({ ...data, password: undefined })
}
export async function DELETE(req, { params }) {
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED SUBCONTRACTORS ──────────────────────────────────────────────────
write(f'{BASE}/subcontractors/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const data = await prisma.subcontractor.findMany({ include: { members: true, assignments: { include: { project: { select: { name: true, code: true } } } }, _count: { select: { members: true, assignments: true } } }, orderBy: { companyName: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const { members, assignments, ...rest } = body
  const data = await prisma.subcontractor.create({ data: { ...rest, members: members ? { create: members } : undefined }, include: { members: true } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/subcontractors/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.subcontractor.findUnique({ where: { id: params.id }, include: { members: true, assignments: { include: { project: { select: { name: true, code: true } } } } } })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
export async function PUT(req, { params }) {
  const body = await req.json()
  const { members, assignments, ...rest } = body
  const data = await prisma.subcontractor.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.subcontractor.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED RISKS ───────────────────────────────────────────────────────────
write(f'{BASE}/risks/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.risk.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { riskScore: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.risk.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/risks/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const { project, ...rest } = body
  const data = await prisma.risk.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.risk.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED LESSONS ─────────────────────────────────────────────────────────
write(f'{BASE}/lessons/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.lesson.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.lesson.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/lessons/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.lesson.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.lesson.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED MILESTONES ──────────────────────────────────────────────────────
write(f'{BASE}/milestones/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.milestone.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { dueDate: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.milestone.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/milestones/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const { project, ...rest } = body
  const data = await prisma.milestone.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.milestone.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED COORDINATION ────────────────────────────────────────────────────
write(f'{BASE}/coordination/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.coordinationItem.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.coordinationItem.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/coordination/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.coordinationItem.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.coordinationItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED SOP ─────────────────────────────────────────────────────────────
write(f'{BASE}/sop/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const division = searchParams.get('division')
  const where = division ? { division } : {}
  const data = await prisma.sop.findMany({ where, orderBy: { title: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.sop.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/sop/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.sop.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.sop.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED KPI ─────────────────────────────────────────────────────────────
write(f'{BASE}/kpi/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const category = searchParams.get('category')
  const where = {}
  if (projectId) where.projectId = projectId
  if (category) where.category = category
  const data = await prisma.kpiMetric.findMany({ where, orderBy: { recordedAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.kpiMetric.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/kpi/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.kpiMetric.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.kpiMetric.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED PREQUAL ─────────────────────────────────────────────────────────
write(f'{BASE}/prequal/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const data = await prisma.prequalSubmission.findMany({ orderBy: { submittedAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.prequalSubmission.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/prequal/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const data = await prisma.prequalSubmission.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.prequalSubmission.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED COMMUNICATION ───────────────────────────────────────────────────
write(f'{BASE}/communication/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const channel = searchParams.get('channel')
  const where = channel ? { channel } : {}
  const data = await prisma.internalMessage.findMany({ where, include: { author: { select: { name: true, avatarHue: true } } }, orderBy: { createdAt: 'asc' }, take: 100 })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.internalMessage.create({ data: body, include: { author: { select: { name: true, avatarHue: true } } } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/communication/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function DELETE(req, { params }) {
  await prisma.internalMessage.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED SCHEDULE ────────────────────────────────────────────────────────
write(f'{BASE}/schedule/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.scheduleItem.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { startDate: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.scheduleItem.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/schedule/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const { project, ...rest } = body
  const data = await prisma.scheduleItem.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.scheduleItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

# ─── ENHANCED REPORTS ─────────────────────────────────────────────────────────
write(f'{BASE}/reports/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() {
  const [projects, tasks, invoices, clashes, cdeDocs, risks, milestones, users, leads] = await Promise.all([
    prisma.project.findMany({ select: { id: true, name: true, status: true, progressPct: true, healthScore: true, budget: true, contractValue: true, startDate: true, endDate: true } }),
    prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.invoice.findMany({ select: { amount: true, status: true, currency: true, issueDate: true } }),
    prisma.clashDetection.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.cdeDocument.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.risk.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.milestone.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.user.findMany({ where: { active: true, role: { not: 'CLIENT' } }, include: { _count: { select: { tasks: true } }, resourceAllocations: { orderBy: { weekStart: 'desc' }, take: 4 } } }),
    prisma.lead.groupBy({ by: ['stage'], _count: { id: true } })
  ])
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices.filter(i => ['SENT', 'OVERDUE'].includes(i.status)).reduce((s, i) => s + i.amount, 0)
  return NextResponse.json({ projects, tasksByStatus: tasks, invoices, clashByStatus: clashes, cdeByStatus: cdeDocs, riskByStatus: risks, milestoneByStatus: milestones, users, leadsByStage: leads, summary: { totalRevenue, outstanding, activeProjects: projects.filter(p => p.status === 'ACTIVE').length, totalProjects: projects.length } })
}
''')

# ─── RESOURCES ────────────────────────────────────────────────────────────────
write(f'{BASE}/resources/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const projectId = searchParams.get('projectId')
  const where = {}
  if (userId) where.userId = userId
  if (projectId) where.projectId = projectId
  const data = await prisma.resourceAllocation.findMany({ where, include: { user: { select: { name: true, capacityHrs: true } }, project: { select: { name: true } } }, orderBy: { weekStart: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.resourceAllocation.create({ data: { ...body, weekStart: new Date(body.weekStart) } })
  return NextResponse.json(data, { status: 201 })
}
''')

write(f'{BASE}/resources/[id]/route.js', '''import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function PUT(req, { params }) {
  const body = await req.json()
  const { user, project, ...rest } = body
  const data = await prisma.resourceAllocation.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
}
export async function DELETE(req, { params }) {
  await prisma.resourceAllocation.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
''')

print('\n✅ All API routes generated!')
