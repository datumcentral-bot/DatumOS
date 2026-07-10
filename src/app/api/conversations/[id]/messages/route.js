import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/broadcast';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const messages = await prisma.convMessage.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const msg = await prisma.convMessage.create({
    data: { ...body, conversationId: params.id },
  });
  // Update conversation lastMessage
  const updatedConv = await prisma.conversation.update({
    where: { id: params.id },
    data: { lastMessage: body.content, lastMessageAt: new Date() },
  });
  // Broadcast to all clients watching this conversation room
  const actorName = session.user?.name || session.user?.email || 'Team';
  broadcast(`conversation:${params.id}`, 'message:new', { message: msg, conversation: updatedConv }, actorName);
  // Also broadcast to the conversations list room so unread counts update
  broadcast('conversations', 'message:new', { conversationId: params.id, message: msg, conversation: updatedConv }, actorName);
  return NextResponse.json(msg, { status: 201 });
}