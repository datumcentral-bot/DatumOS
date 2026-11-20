import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function PUT(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { id, midpId, ...rest } = body
  const data = await prisma.midpDeliverable.update({ where: { id: params.delivId }, data: rest })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}

export async function DELETE(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  await prisma.midpDeliverable.delete({ where: { id: params.delivId } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
