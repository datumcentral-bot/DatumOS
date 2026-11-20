import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req, ) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const data = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(data)
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const data = await prisma.tag.create({ data: body })
  return NextResponse.json(data, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
