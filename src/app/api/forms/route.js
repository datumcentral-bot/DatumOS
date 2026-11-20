import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) { try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const forms = await prisma.datumForm.findMany({
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(forms);
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req) { try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const form = await prisma.datumForm.create({ data: body });
  return NextResponse.json(form, { status: 201 });
 } catch (err) { return errorResponse(err, req); }}
