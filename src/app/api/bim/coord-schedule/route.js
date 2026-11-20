import { NextResponse } from 'next/server'
import { sanitize } from '@/lib/sanitize'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const where = projectId ? { projectId } : {}
  const data = await prisma.bimCoordSchedule.findMany({
    where,
    include: { project: { select: { name: true } } },
    orderBy: { meetingDate: 'asc' }
  })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { id, ...rest } = body
  const data = await prisma.bimCoordSchedule.create({
    data: {
      ...rest,
      meetingDate: rest.meetingDate ? new Date(rest.meetingDate) : new Date(),
      projectId: rest.projectId || undefined
    },
    include: { project: { select: { name: true } } }
  })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
