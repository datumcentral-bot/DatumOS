import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, guard } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/broadcast';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Conversations contain inbound contact details and CRM correspondence.
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
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
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const conv = await prisma.conversation.create({ data: {
    contactName: body.contactName,
    contactEmail: body.contactEmail,
    contactCompany: body.contactCompany,
    status: body.status,
    channel: body.channel,
    lastMessage: body.lastMessage,
    lastMessageAt: body.lastMessageAt ? new Date(body.lastMessageAt) : undefined,
  }});
  broadcast('conversations', 'created', conv, session.user?.name || session.user?.email || 'Director');
  return NextResponse.json(conv, { status: 201 });
 } catch (err) { return errorResponse(err, req); }}
