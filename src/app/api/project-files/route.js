import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId') || searchParams.get('clientProjectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.projectFile.findMany({ where, orderBy: { uploadedAt: 'desc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { clientProjectId, ...rest } = body
  const data = await prisma.projectFile.create({ data: { ...rest, projectId: rest.projectId || clientProjectId || null } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
export async function DELETE(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await prisma.projectFile.delete({ where: { id } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
