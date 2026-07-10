import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req, { params }) {
  const data = await prisma.clientRequirement.findMany({ where: { clientId: params.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req, { params }) {
  const body = await req.json()
  const data = await prisma.clientRequirement.create({ data: { ...body, clientId: params.id } })
  return NextResponse.json(data, { status: 201 })
}
