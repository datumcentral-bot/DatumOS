import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard, ROLES } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function PUT(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR);
  if (denied) return denied;
  const body = await req.json()
  const { client, project, ...rest } = body
  const data = await prisma.invoice.update({ where: { id: params.id }, data: rest })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function DELETE(req, { params }) { try {
  const denied = await guard(ROLES.DIRECTOR);
  if (denied) return denied;
  await prisma.invoice.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
