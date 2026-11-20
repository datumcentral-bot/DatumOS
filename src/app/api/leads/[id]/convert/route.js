import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
export async function POST(req, { params }) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const lead = await prisma.lead.findUnique({ where: { id: params.id } })
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  const client = await prisma.client.create({ data: { companyName: lead.company, contactName: lead.contactName, contactEmail: lead.contactEmail || '', contactPhone: lead.contactPhone, country: lead.country || 'UAE', status: 'ACTIVE', notes: lead.notes } })
  await prisma.lead.update({ where: { id: params.id }, data: { stage: 'WON', convertedToClientId: client.id } })
  return NextResponse.json({ client, message: 'Lead converted to client' })
 } catch (err) { return errorResponse(err, req); }}
