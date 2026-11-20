import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const parentId = searchParams.get('parentId')
  const where = parentId ? { parentId } : { parentId: { not: null } }
  const data = await prisma.task.findMany({ where, include: { assignee: { select: { name: true } } }, orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.task.create({ data: body, include: { assignee: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
