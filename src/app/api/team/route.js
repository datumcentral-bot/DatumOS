import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const where = { role: { not: 'CLIENT' } }
  if (role) where.role = role
  const data = await prisma.user.findMany({ where, include: { _count: { select: { tasks: true, assignments: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json(data.map(u => ({ ...u, password: undefined })))
}
export async function POST(req) {
  const body = await req.json()
  const { password, ...rest } = body
  const hashed = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('Member@2026!', 10)
  const data = await prisma.user.create({ data: { ...rest, password: hashed } })
  return NextResponse.json({ ...data, password: undefined }, { status: 201 })
}
