import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const where = status ? { status } : {};
  const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return NextResponse.json({ reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const review = await prisma.review.create({ data: body });
  return NextResponse.json(review, { status: 201 });
}
