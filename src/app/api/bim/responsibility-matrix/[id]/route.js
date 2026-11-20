import { NextResponse } from 'next/server'
import { sanitize } from '@/lib/sanitize'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
export async function PUT(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const raw = await req.json()
  const body = sanitize(raw)
  const data = await prisma.responsibilityMatrix.update({ where: { id: params.id }, data: body })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function DELETE(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  await prisma.responsibilityMatrix.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
