import { NextResponse } from 'next/server'
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
  const data = await prisma.bep.findMany({ where, include: { project: { select: { name: true, code: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.bep.create({ data: body, include: { project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
