import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const data = await prisma.subcontractor.findMany({ include: { members: true, _count: { select: { assignments: true } } }, orderBy: { companyName: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
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
}
