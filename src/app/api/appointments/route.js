import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, guard } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcast } from '@/lib/broadcast';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Appointment has no project/client ownership columns in the current schema.
// Keep the shared company calendar staff-only until appointments gain tenant keys.
export async function GET(req) { try {
  const denied = await guard('DIRECTOR', 'MEMBER');
  if (denied) return denied;
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
 } catch (err) { return errorResponse(err, req); }}

export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const data = {
    title: body.title,
    description: body.description,
    type: body.type,
    startTime: body.startTime ? new Date(body.startTime) : undefined,
    endTime: body.endTime ? new Date(body.endTime) : undefined,
    attendees: body.attendees,
    location: body.location,
    status: body.status,
  };
  const appt = await prisma.appointment.create({ data });
  broadcast('appointments', 'created', appt, session.user?.name || 'Director');
  return NextResponse.json(appt, { status: 201 });
 } catch (err) { return errorResponse(err, req); }}
