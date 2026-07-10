import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const projects = await prisma.project.findMany({
      where: clientId ? { clientId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true, country: true } },
        projectFiles: true,
        deliverables: true,
        _count: { select: { tasks: true, risks: true } }
      },
    })
    return NextResponse.json(projects)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const b = await req.json()
    const { files, deliverables, subAssignments, bep, eirAir, progress, isoStatus, projectType, stage, scopeSummary, requirements, health, ...rest } = b
    const project = await prisma.project.create({
      data: {
        ...rest,
        progressPct: progress ? parseInt(progress) : 0,
        isoStage: isoStatus || null,
        phase: stage || null,
        description: scopeSummary || rest.description || null,
        healthScore: health === 'GREEN' ? 90 : health === 'AMBER' ? 60 : health === 'RED' ? 30 : 75,
      },
      include: { client: { select: { id: true, companyName: true } } }
    })
    return NextResponse.json(project, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const b = await req.json()
    const { id, files, deliverables, subAssignments, bep, eirAir, progress, isoStatus, projectType, stage, scopeSummary, requirements, health, ...rest } = b
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        progressPct: progress ? parseInt(progress) : undefined,
        isoStage: isoStatus || undefined,
        phase: stage || undefined,
        description: scopeSummary || rest.description || undefined,
        healthScore: health === 'GREEN' ? 90 : health === 'AMBER' ? 60 : health === 'RED' ? 30 : undefined,
      }
    })
    return NextResponse.json(project)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
