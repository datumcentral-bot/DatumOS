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
    const data = await prisma.milestone.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { dueDate: 'asc' } })
    return NextResponse.json(data)
  } catch (e) {
    return errorResponse(e, req)}
}
export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const body = await req.json()
    const data = await prisma.milestone.create({ data: body })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return errorResponse(e, req)}
}
