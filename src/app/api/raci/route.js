import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.raciEntry.findMany({ orderBy: { task: 'asc' } })) }
export async function POST(req) { const b = await req.json(); return NextResponse.json(await prisma.raciEntry.create({ data: b }), { status: 201 }) }
