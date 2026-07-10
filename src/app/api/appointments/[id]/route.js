import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appt = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(appt);
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (body.startTime) body.startTime = new Date(body.startTime);
  if (body.endTime) body.endTime = new Date(body.endTime);
  const appt = await prisma.appointment.update({ where: { id: params.id }, data: body });
  return NextResponse.json(appt);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
