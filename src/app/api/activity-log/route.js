import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const entity = searchParams.get('entity')
  const where = entity ? { entity } : {}
  const data = await prisma.activityLog.findMany({ where, include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: 'desc' }, take: 200 })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.activityLog.create({ data: body })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
