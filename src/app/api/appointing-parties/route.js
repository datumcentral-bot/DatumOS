import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.appointingParty.findMany({ orderBy: { name: 'asc' } })) }
export async function POST(req) { const b = await req.json(); return NextResponse.json(await prisma.appointingParty.create({ data: b }), { status: 201 }) }
export async function PUT(req) { try { const { searchParams } = new URL(req.url); const id = searchParams.get('id'); const b = await req.json(); const { id: bid, ...rest } = b; return NextResponse.json(await prisma.appointingParty.update({ where: { id: id || bid }, data: rest })) } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) } }
export async function DELETE(req) { try { const { searchParams } = new URL(req.url); const id = searchParams.get('id'); await prisma.appointingParty.delete({ where: { id } }); return NextResponse.json({ ok: true }) } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) } }
