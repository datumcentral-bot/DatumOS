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
  const data = await prisma.midp.findMany({ where, include: { project: { select: { name: true } }, deliverables: true, tidps: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { deliverables, ...rest } = body
  const data = await prisma.midp.create({ data: { ...rest, deliverables: deliverables ? { create: deliverables } : undefined }, include: { deliverables: true } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
