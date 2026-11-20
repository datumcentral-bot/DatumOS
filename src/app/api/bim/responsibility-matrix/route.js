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
  const data = await prisma.responsibilityMatrix.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { discipline: 'asc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const raw = await req.json()
  const body = sanitize(raw)
  const data = await prisma.responsibilityMatrix.create({ data: body })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
