import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const division = searchParams.get('division') || searchParams.get('divisionCode')
  const where = division ? { OR: [{ division }, { divisionCode: division }] } : {}
  const data = await prisma.sop.findMany({ where, orderBy: { title: 'asc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
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
 } catch (err) { return errorResponse(err, req); }}
