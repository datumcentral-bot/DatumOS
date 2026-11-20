import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
export const dynamic = "force-dynamic";
export async function PUT(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const body = await req.json()
    const { project, ...rest } = body
    const data = await prisma.milestone.update({ where: { id: params.id }, data: rest })
    return NextResponse.json(data)
  } catch (e) {
    return errorResponse(e, req)}
}
export async function DELETE(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    await prisma.milestone.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return errorResponse(e, req)}
}
