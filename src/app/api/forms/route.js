import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const forms = await prisma.datumForm.findMany({
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(forms);
  } catch (err) { return errorResponse(err, req); }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const body = await req.json();
    const { id, submissions, submissionCount, createdAt, updatedAt, ...data } = body;
    const form = await prisma.datumForm.create({ data });
    return NextResponse.json(form, { status: 201 });
  } catch (err) { return errorResponse(err, req); }
}
