import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const data = await prisma.subcontractor.findMany({ include: { members: true, _count: { select: { assignments: true } } }, orderBy: { companyName: 'asc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { members, assignments, specialty, contactName, active, ...rest } = body
  const data = await prisma.subcontractor.create({ data: {
    ...rest,
    specialization: rest.specialization || specialty || null,
    specialty: specialty || null,
    contactPerson: rest.contactPerson || contactName || null,
    contactName: contactName || null,
    active: active !== undefined ? active : true,
    status: active === false ? 'INACTIVE' : (rest.status || 'ACTIVE'),
  }, include: { members: true } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
