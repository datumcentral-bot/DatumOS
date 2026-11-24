import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Submissions contain personal and potentially commercially sensitive data.
// The current schema has no submitter/client foreign key, so tenant-scoped reads
// are not possible; keep both management and retrieval Director-only.
export async function GET(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: { formId: params.id },
      orderBy: { submittedAt: 'desc' },
    });
    return NextResponse.json(submissions);
  } catch (err) { return errorResponse(err, req); }
}

export async function POST(req, { params }) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const form = await prisma.datumForm.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    if (form.status !== 'ACTIVE') return NextResponse.json({ error: 'Form is not active' }, { status: 409 });
    const body = await req.json();
    const submission = await prisma.formSubmission.create({
      data: {
        formId: params.id,
        data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data ?? {}),
      },
    });
    await prisma.datumForm.update({
      where: { id: params.id },
      data: { submissionCount: { increment: 1 } },
    });
    return NextResponse.json(submission, { status: 201 });
  } catch (err) { return errorResponse(err, req); }
}
