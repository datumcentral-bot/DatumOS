import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')
  const projectId = searchParams.get('projectId')
  const where = {}
  if (taskId) where.taskId = taskId
  if (projectId) where.projectId = projectId
  const data = await prisma.attachment.findMany({ where, orderBy: { uploadedAt: 'desc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.attachment.create({ data: body })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
