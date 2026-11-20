import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) { try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(campaign);
 } catch (err) { return errorResponse(err, req); }}

export async function PUT(req, { params }) { try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const campaign = await prisma.campaign.update({ where: { id: params.id }, data: body });
  return NextResponse.json(campaign);
 } catch (err) { return errorResponse(err, req); }}

export async function DELETE(req, { params }) { try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.campaign.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
 } catch (err) { return errorResponse(err, req); }}
