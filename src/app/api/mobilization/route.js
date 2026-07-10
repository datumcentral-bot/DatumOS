import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET() { return NextResponse.json(await prisma.mobilizationItem.findMany({ orderBy: { createdAt: 'desc' } })) }
export async function POST(req) { const b = await req.json(); const { dueDate, ...rest } = b; return NextResponse.json(await prisma.mobilizationItem.create({ data: { ...rest, dueDate: dueDate || null } }), { status: 201 }) }
