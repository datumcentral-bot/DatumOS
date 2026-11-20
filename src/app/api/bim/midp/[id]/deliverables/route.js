import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const data = await prisma.midpDeliverable.findMany({ where: { midpId: params.id }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { id, ...rest } = body
  const data = await prisma.midpDeliverable.create({ data: { ...rest, midpId: params.id } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
