import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req, ) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied; return NextResponse.json(await prisma.mobilizationItem.findMany({ orderBy: { createdAt: 'desc' } }))  } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied; const b = await req.json(); const { dueDate, ...rest } = b; return NextResponse.json(await prisma.mobilizationItem.create({ data: { ...rest, dueDate: dueDate || null } }), { status: 201 })  } catch (err) { return errorResponse(err, req); }}
