import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function PUT(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { id, tidpId, element, responsible, lodRequired, plannedDate, ...rest } = body
  const data = await prisma.tidpItem.update({
    where: { id: params.itemId },
    data: {
      ...rest,
      lodLevel: lodRequired,
      dueDate: plannedDate ? new Date(plannedDate) : undefined
    }
  })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}

export async function DELETE(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  await prisma.tidpItem.delete({ where: { id: params.itemId } })
  return NextResponse.json({ ok: true })
 } catch (err) { return errorResponse(err, req); }}
