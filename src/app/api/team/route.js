import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const where = { role: { not: 'CLIENT' } }
  if (role) where.role = role
  const data = await prisma.user.findMany({ where, include: { _count: { select: { tasks: true, assignments: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json(data.map(u => ({ ...u, password: undefined })))
 } catch (err) { return errorResponse(err, req); }}
export async function POST(req) { try {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const body = await req.json()
  const { password, ...rest } = body
  const hashed = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('Member@2026!', 10)
  const data = await prisma.user.create({ data: { ...rest, password: hashed } })
  return NextResponse.json({ ...data, password: undefined }, { status: 201 })
 } catch (err) { return errorResponse(err, req); }}
