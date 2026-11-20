import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function PUT(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { id, eirId, category, order, ...rest } = body
  const data = await prisma.eirSection.update({ where: { id: params.secId }, data: rest })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}

export async function DELETE(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  await prisma.eirSection.delete({ where: { id: params.secId } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
