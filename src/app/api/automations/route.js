import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) { try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const where = status ? { status } : {};
  const automations = await prisma.automation.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(automations);
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req) { try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const automation = await prisma.automation.create({ data: body });
  return NextResponse.json(automation, { status: 201 });
 } catch (err) { return errorResponse(err, req); }}
