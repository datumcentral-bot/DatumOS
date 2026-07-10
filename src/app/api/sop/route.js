import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const division = searchParams.get('division') || searchParams.get('divisionCode')
  const where = division ? { OR: [{ division }, { divisionCode: division }] } : {}
  const data = await prisma.sop.findMany({ where, orderBy: { title: 'asc' } })
  return NextResponse.json(data)
}
export async function POST(req) {
  const raw = await req.json()
  // Map page fields to schema fields
  const { divisionCode, summary, checklist, steps, ...rest } = raw
  const data = await prisma.sop.create({ data: {
    ...rest,
    division: rest.division || divisionCode || null,
    divisionCode: divisionCode || rest.division || null,
    notes: rest.notes || summary || null,
    summary: summary || null,
    steps: steps || null,
  }})
  return NextResponse.json(data, { status: 201 })
}
