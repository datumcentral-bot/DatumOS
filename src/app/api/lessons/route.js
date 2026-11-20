import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.lesson.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const raw = await req.json()
    const { id, project, ...body } = raw
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    const data = await prisma.lesson.create({ data: body })
    return NextResponse.json(data, { status: 201 })
  } catch(e) { return errorResponse(e, req)}
}
export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const raw = await req.json()
    const { id, project, ...body } = raw
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    const data = await prisma.lesson.update({ where: { id }, data: body })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return errorResponse(e, req)}
}
