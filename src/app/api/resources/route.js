import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const projectId = searchParams.get('projectId')
  const where = {}
  if (userId) where.userId = userId
  if (projectId) where.projectId = projectId
  const data = await prisma.resourceAllocation.findMany({ where, include: { user: { select: { name: true, capacityHrs: true } }, project: { select: { name: true } } }, orderBy: { weekStart: 'desc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.resourceAllocation.create({ data: { ...body, weekStart: new Date(body.weekStart) } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
