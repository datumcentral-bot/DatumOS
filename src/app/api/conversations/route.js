import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/broadcast';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const channel = searchParams.get('channel');
  const where = {};
  if (status) where.status = status;
  if (channel) where.channel = channel;
  const conversations = await prisma.conversation.findMany({
    where,
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { lastMessageAt: 'desc' },
  });
  return NextResponse.json(conversations);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const conv = await prisma.conversation.create({ data: body });
  broadcast('conversations', 'created', conv, session.user?.name || session.user?.email || 'Director');
  return NextResponse.json(conv, { status: 201 });
}