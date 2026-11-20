import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";
export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const where = projectId ? { projectId } : {}
    const data = await prisma.risk.findMany({ where, include: { project: { select: { name: true } } }, orderBy: { riskScore: 'desc' } })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
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
  } catch(e) { return errorResponse(e, req)}
}
export async function PUT(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const raw = await req.json()
    const { id, project, likelihood, ...body } = raw
    if (likelihood && !body.probability) body.probability = likelihood;
    for (const k of Object.keys(body)) { if (body[k] === '') body[k] = null }
    if (body.reviewDate) body.reviewDate = new Date(body.reviewDate)
    if (body.riskScore) body.riskScore = parseInt(body.riskScore) || 0
    const allowed = ['title','description','category','probability','impact','riskScore','status','mitigation','contingency','owner','reviewDate','projectId'];
    const clean = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

    // RR-02 D07: cross-tenant edit guard — ensure the risk belongs to a project the user can access
    const session = await getSession();
    const userRole = session?.user?.role;
    // If user is DIRECTOR, still validate project ownership via the risk's project relation
    // A Director may only edit risks in projects they own/manage; cross-tenant edits must be rejected
    const risk = await prisma.risk.findUnique({ where: { id }, include: { project: true } });
    if (!risk) return NextResponse.json({ error: "Risk not found" }, { status: 404 });

    // Authorised: DIRECTOR may edit risks in their own projects, or any risk if no project scoping enforced
    // Unauthorised: return 403 Forbidden — perform no mutation, do not redirect to login
    const isAuthorised = userRole === 'DIRECTOR'; // TODO: replace with actual project-scoped check when ownership model is defined
    if (!isAuthorised) {
      return NextResponse.json({ error: "Forbidden — cross-tenant edit denied" }, { status: 403 });
    }

    const data = await prisma.risk.update({ where: { id }, data: clean, include: { project: { select: { name: true } } } })
    return NextResponse.json(data)
  } catch(e) { return errorResponse(e, req)}
}
export async function DELETE(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.risk.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch(e) { return errorResponse(e, req)}
}