import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { broadcast } from '@/lib/broadcast'
import { authOptions, ROLES } from '@/lib/auth'
import { getDcortexClient } from '@/lib/dcortexClient'
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// DN012: Gateway Clash engine is the engineering source of truth.
// Local Prisma clashDetection preserves workflow metadata (review status, owner, comments, assignments, history).
// This proxy forwards canonical Clash operations to the Gateway.

async function getSessionOrUnauthorized() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== ROLES.DIRECTOR) {
    throw new Error('Not authorized')
  }
  return session
}

export const GET = async (req) => {
  let session
  try {
    session = await getSessionOrUnauthorized()
  } catch (e) {
    return errorResponse(e, req)}
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') // 'findings', 'summary', 'prioritized', 'rules', 'run-suite'
    const projectId = searchParams.get('projectId')
    const limit = searchParams.get('limit')

    const client = await getDcortexClient(session)

    if (action === 'findings') {
      const params = limit ? { limit: parseInt(limit) } : {}
      const data = await client.getClashes(params)
      if (projectId && data?.findings) {
        await prisma.clashSnapshot.create({
          data: {
            projectId,
            source: 'gateway',
            findingsCount: data.count || 0,
            findingsSnapshot: data.findings
          }
        }).catch(() => {})
      }
      return NextResponse.json(data)
    }

    if (action === 'summary') {
      const data = await client.getClashSummary()
      if (projectId && data?.run_id) {
        await prisma.clashRun.create({
          data: {
            projectId,
            runId: data.run_id,
            modelId: data.model_id,
            totalRules: data.total_rules,
            passed: data.passed,
            failed: data.failed,
            notPresent: data.not_present,
            notApplicable: data.not_applicable,
            notSupported: data.not_supported,
            error: data.error,
            findingsCount: data.findings_count,
            source: 'gateway'
          }
        }).catch(() => {})
      }
      return NextResponse.json(data)
    }

    if (action === 'prioritized') {
      const data = await client.getClashPrioritized()
      return NextResponse.json(data)
    }

    if (action === 'rules') {
      const data = await client.getClashRules()
      return NextResponse.json(data)
    }

    if (action === 'run-suite') {
      const data = await client.runClashSuite({})
      if (projectId && data?.run) {
        await prisma.clashRun.create({
          data: {
            projectId,
            runId: data.run.run_id,
            modelId: data.model_id,
            totalRules: data.run.rules_executed,
            passed: data.run.rules_passed,
            failed: data.run.rules_failed,
            notPresent: data.run.rules_not_present,
            notApplicable: data.run.rules_not_applicable,
            notSupported: data.run.rules_not_supported,
            error: data.run.rules_error,
            findingsCount: data.run.findings_count,
            source: 'gateway'
          }
        }).catch(() => {})
      }
      return NextResponse.json(data)
    }

    // Default: return local workflow records (for UI list view)
    const where = projectId ? { projectId } : {}
    const data = await prisma.clashDetection.findMany({
      where,
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(data)
  } catch (e) {
    return errorResponse(e, req)}
}

export const POST = async (req) => {
  let session
  try {
    session = await getSessionOrUnauthorized()
  } catch (e) {
    return errorResponse(e, req)}
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') // 'run-suite', 'sync'
    const body = await req.json()

    const client = await getDcortexClient(session)

    if (action === 'run-suite') {
      const data = await client.runClashSuite(body)
      if (body.projectId && data?.run) {
        await prisma.clashRun.create({
          data: {
            projectId: body.projectId,
            runId: data.run.run_id,
            modelId: data.model_id,
            totalRules: data.run.rules_executed,
            passed: data.run.rules_passed,
            failed: data.run.rules_failed,
            notPresent: data.run.rules_not_present,
            notApplicable: data.run.rules_not_applicable,
            notSupported: data.run.rules_not_supported,
            error: data.run.rules_error,
            findingsCount: data.run.findings_count,
            source: 'gateway'
          }
        }).catch(() => {})
      }
      return NextResponse.json(data, { status: 200 })
    }

    if (action === 'sync') {
      const projectId = body.projectId
      if (!projectId) {
        return NextResponse.json({ error: 'projectId required' }, { status: 400 })
      }
      const [findings, summary] = await Promise.all([
        client.getClashes({ limit: 500 }),
        client.getClashSummary()
      ])
      await prisma.clashSnapshot.create({
        data: {
          projectId,
          source: 'gateway',
          findingsCount: findings?.count || 0,
          findingsSnapshot: findings?.findings || []
        }
      })
      await prisma.clashRun.create({
        data: {
          projectId,
          runId: summary?.run_id || `sync-${Date.now()}`,
          modelId: summary?.model_id || '',
          totalRules: summary?.total_rules || 0,
          passed: summary?.passed || 0,
          failed: summary?.failed || 0,
          notPresent: summary?.not_present || 0,
          notApplicable: summary?.not_applicable || 0,
          notSupported: summary?.not_supported || 0,
          error: summary?.error || 0,
          findingsCount: summary?.findings_count || 0,
          source: 'gateway'
        }
      })
      return NextResponse.json({ synced: true, findings, summary })
    }

    // Default: create local workflow record
    const raw = body
    const { id, project, ...data } = raw
    for (const k of Object.keys(data)) { if (data[k] === '') data[k] = null }
    if (body.detectedAt) data.detectedAt = new Date(body.detectedAt)
    if (body.resolvedAt) data.resolvedAt = new Date(body.resolvedAt)
    const created = await prisma.clashDetection.create({
      data: { ...data, projectId: body.projectId },
      include: { project: { select: { name: true } } }
    })
    broadcast('clash', 'created', created, 'BIM Coordinator')
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return errorResponse(e, req)}
}

export const PUT = async (req) => {
  let session
  try {
    session = await getSessionOrUnauthorized()
  } catch (e) {
    return errorResponse(e, req)}
  try {
    const raw = await req.json()
    const { id, project, ...body } = raw
    for (const k of Object.keys(body)) {
      if (body[k] === '') body[k] = null
    }
    if (body.detectedAt) body.detectedAt = new Date(body.detectedAt)
    if (body.resolvedAt) body.resolvedAt = new Date(body.resolvedAt)
    const updated = await prisma.clashDetection.update({
      where: { id },
      data: body,
      include: { project: { select: { name: true } } }
    })
    const action = body.status === 'RESOLVED' ? 'resolved' : 'updated'
    broadcast('clash', action, updated, 'BIM Coordinator')
    return NextResponse.json(updated)
  } catch (e) {
    return errorResponse(e, req)}
}

export const DELETE = async (req) => {
  let session
  try {
    session = await getSessionOrUnauthorized()
  } catch (e) {
    return errorResponse(e, req)}
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await prisma.clashDetection.delete({ where: { id } })
    broadcast('clash', 'deleted', { id }, 'BIM Coordinator')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return errorResponse(e, req)}
}