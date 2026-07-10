import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.risk.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { riskScore: 'desc' } })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function POST(req) {
  try {
    const raw = await req.json()
    const { id, project, likelihood, ...body } = raw
    // Map likelihood -> probability for backward compat
    if (likelihood && !body.probability) body.probability = likelihood;
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.reviewDate) body.reviewDate = new Date(body.reviewDate)
    if (body.riskScore) body.riskScore = parseInt(body.riskScore) || 0
    // Only keep valid Risk fields
    const allowed = ['title','description','category','probability','impact','riskScore','status','mitigation','contingency','owner','reviewDate','projectId','trend'];
    const clean = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    // Compute riskScore if probability and impact are numeric
    if (clean.probability && clean.impact && !isNaN(clean.probability) && !isNaN(clean.impact)) {
      clean.riskScore = Number(clean.probability) * Number(clean.impact);
      clean.probability = String(clean.probability);
      clean.impact = String(clean.impact);
    }
    const data = await prisma.risk.create({ data: clean, include: { project: { select: { name: true } } } })
    return NextResponse.json(data, { status: 201 })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function PUT(req) {
  try {
    const raw = await req.json()
    const { id, project, likelihood, ...body } = raw
    if (likelihood && !body.probability) body.probability = likelihood;
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.reviewDate) body.reviewDate = new Date(body.reviewDate)
    if (body.riskScore) body.riskScore = parseInt(body.riskScore) || 0
    const allowed = ['title','description','category','probability','impact','riskScore','status','mitigation','contingency','owner','reviewDate','projectId'];
    const clean = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    const data = await prisma.risk.update({ where: { id }, data: clean, include: { project: { select: { name: true } } } })
    return NextResponse.json(data)
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.risk.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}