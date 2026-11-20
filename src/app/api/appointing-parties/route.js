import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET() {
  const denied = await guard('DIRECTOR');
  if (denied) return denied; return NextResponse.json(await prisma.appointingParty.findMany({ orderBy: { name: 'asc' } })) }
export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied; const b = await req.json(); return NextResponse.json(await prisma.appointingParty.create({ data: b }), { status: 201 }) }
export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied; try { const { searchParams } = new URL(req.url); const id = searchParams.get('id'); const b = await req.json(); const { id: bid, ...rest } = b; return NextResponse.json(await prisma.appointingParty.update({ where: { id: id || bid }, data: rest })) } catch(e) { return errorResponse(e, req)} }
export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied; try { const { searchParams } = new URL(req.url); const id = searchParams.get('id'); await prisma.appointingParty.delete({ where: { id } }); return NextResponse.json({ ok: true }) } catch(e) { return errorResponse(e, req)} }
