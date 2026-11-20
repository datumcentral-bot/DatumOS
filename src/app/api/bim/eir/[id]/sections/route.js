import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const data = await prisma.eirSection.findMany({ where: { eirId: params.id }, orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { id, eirId, category, order, ...rest } = body
  const count = await prisma.eirSection.count({ where: { eirId: params.id } })
  const data = await prisma.eirSection.create({
    data: {
      ...rest,
      eirId: params.id,
      sectionNo: String(count + 1),
      orderIndex: order || count
    }
  })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
