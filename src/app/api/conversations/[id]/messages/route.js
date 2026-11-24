import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/broadcast';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const messages = await prisma.convMessage.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json();
  const msg = await prisma.convMessage.create({
    data: {
      conversationId: params.id,
      content: body.content,
      type: body.type,
      direction: body.direction,
      senderName: body.senderName,
    },
  });
  const updatedConv = await prisma.conversation.update({
    where: { id: params.id },
    data: { lastMessage: body.content, lastMessageAt: new Date() },
  });
  broadcast(`conversation:${params.id}`, 'message:new', { message: msg, conversation: updatedConv }, 'Director');
  broadcast('conversations', 'message:new', { conversationId: params.id, message: msg, conversation: updatedConv }, 'Director');
  return NextResponse.json(msg, { status: 201 });
 } catch (err) { return errorResponse(err, req); }}
