import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.financialEntry.findMany({ where, include: { project: { select: { name: true, code: true } }, client: { select: { companyName: true } } }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { id, project, client, description, ...rest } = body
    if (!rest.title && description) rest.title = description;
    if (!rest.title) rest.title = 'Financial Entry';
    if (rest.projectId === '') rest.projectId = null
    if (rest.clientId === '') rest.clientId = null
    if (rest.dueDate === '') rest.dueDate = null
    if (rest.paidDate === '') rest.paidDate = null
    if (rest.amount) rest.amount = parseFloat(rest.amount) || 0
    const data = await prisma.financialEntry.create({ data: rest })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const body = await req.json()
    const { id: bodyId, project, client, description, ...rest } = body
    if (!rest.title && description) rest.title = description;
    if (rest.projectId === '') rest.projectId = null
    if (rest.clientId === '') rest.clientId = null
    if (rest.dueDate === '') rest.dueDate = null
    if (rest.paidDate === '') rest.paidDate = null
    if (rest.amount) rest.amount = parseFloat(rest.amount) || 0
    const data = await prisma.financialEntry.update({ where: { id: id || bodyId }, data: rest })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.financialEntry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}