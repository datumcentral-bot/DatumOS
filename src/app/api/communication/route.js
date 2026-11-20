import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const channel = searchParams.get('channel')
  const where = channel ? { channel } : {}
  const data = await prisma.internalMessage.findMany({ where, include: { author: { select: { name: true, avatarHue: true } } }, orderBy: { createdAt: 'asc' }, take: 100 })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.internalMessage.create({ data: body, include: { author: { select: { name: true, avatarHue: true } } } })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
