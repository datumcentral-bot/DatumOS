import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const submissions = await prisma.formSubmission.findMany({
    where: { formId: params.id },
    orderBy: { submittedAt: 'desc' },
  });
  return NextResponse.json(submissions);
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const submission = await prisma.formSubmission.create({
    data: { ...body, formId: params.id },
  });
  await prisma.datumForm.update({
    where: { id: params.id },
    data: { submissionCount: { increment: 1 } },
  });
  return NextResponse.json(submission, { status: 201 });
}
