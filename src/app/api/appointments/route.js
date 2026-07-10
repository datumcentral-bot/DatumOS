import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/broadcast';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (from || to) {
    where.startTime = {};
    if (from) where.startTime.gte = new Date(from);
    if (to) where.startTime.lte = new Date(to);
  }
  const appointments = await prisma.appointment.findMany({ where, orderBy: { startTime: 'asc' } });
  return NextResponse.json(appointments);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (body.startTime) body.startTime = new Date(body.startTime);
  if (body.endTime) body.endTime = new Date(body.endTime);
  const appt = await prisma.appointment.create({ data: body });
  broadcast('appointments', 'created', appt, session.user?.name || 'Director');
  return NextResponse.json(appt, { status: 201 });
}