import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const meetingId = searchParams.get('meetingId')
  const where = meetingId ? { meetingId } : {}
  const data = await prisma.meetingParticipant.findMany({ where, include: { user: { select: { name: true, email: true } } } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.meetingParticipant.create({ data: body })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
