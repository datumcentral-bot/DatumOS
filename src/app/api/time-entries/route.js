import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR','MEMBER');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const userId = searchParams.get('userId')
  const where = {}
  if (taskId) where.taskId = taskId
  if (userId) where.userId = userId
  const data = await prisma.timeEntry.findMany({ where, include: { user: { select: { name: true } }, task: { select: { title: true } } }, orderBy: { startedAt: 'desc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR','MEMBER');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.timeEntry.create({ data: body, include: { user: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
