import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) { try {
  const denied = await guard('DIRECTOR', 'MEMBER');
  if (denied) return denied;
  const appt = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(appt);
 } catch (err) { return errorResponse(err, req); }}

export async function PUT(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
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
  const appt = await prisma.appointment.update({ where: { id: params.id }, data });
  return NextResponse.json(appt);
 } catch (err) { return errorResponse(err, req); }}

export async function DELETE(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
 } catch (err) { return errorResponse(err, req); }}
