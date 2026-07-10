import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const where = {}
  if (clientId) where.clientId = clientId
  if (projectId) where.projectId = projectId
  if (status) where.status = status
  const data = await prisma.invoice.findMany({ where, include: { client: { select: { companyName: true } }, project: { select: { name: true, code: true } } }, orderBy: { issueDate: 'desc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const body = await req.json()
  const data = await prisma.invoice.create({ data: body, include: { client: { select: { companyName: true } }, project: { select: { name: true } } } })
  return NextResponse.json(data, { status: 201 })
}
