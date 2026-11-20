import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions, ROLES } from '@/lib/auth'
import { getDcortexClient } from '@/lib/dcortexClient'
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// DN011: Gateway QA engine is the engineering source of truth.
// Local Prisma bimVerifyCheck preserves workflow metadata (review status, comments, assignments).
// This proxy forwards canonical QA operations to the Gateway.

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
    const action = searchParams.get('action') // 'rules', 'summary', 'runtime', 'run-suite'
    const scope = searchParams.get('scope') // 'core' | 'extended' | 'all'
    const category = searchParams.get('category')
    const projectId = searchParams.get('projectId')

    const client = await getDcortexClient(session)

    if (action === 'rules') {
      const params = scope ? { scope } : {}
      const data = await client.getQaRules(params)
      if (projectId && data?.rules) {
        await prisma.bimQaSnapshot.create({
          data: {
            projectId,
            scope: scope || 'core',
            ruleCount: data.total_count || data.count || 0,
            rulesSnapshot: data.rules,
            source: 'gateway'
          }
        }).catch(() => {}) // non-blocking
      }
      return NextResponse.json(data)
    }

    if (action === 'summary') {
      const data = await client.getQaSummary()
      return NextResponse.json(data)
    }

    if (action === 'runtime') {
      const data = await client.getQaRuntime()
      return NextResponse.json(data)
    }

    if (action === 'run-suite') {
      const body = { scope: scope || 'core' }
      if (category) body.category = category
      const data = await client.runQaSuite(body)
      if (projectId && data?.run) {
        await prisma.bimQaRun.create({
          data: {
            projectId,
            runId: data.run.run_id,
            scope: data.scope || 'core',
            modelId: data.model_id,
            rulesExecuted: data.run.rules_executed,
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
    const data = await prisma.bimVerifyCheck.findMany({
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
      const data = await client.runQaSuite(body)
      if (body.projectId && data?.run) {
        await prisma.bimQaRun.create({
          data: {
            projectId: body.projectId,
            runId: data.run.run_id,
            scope: data.scope || 'core',
            modelId: data.model_id,
            rulesExecuted: data.run.rules_executed,
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
      const [rules, summary] = await Promise.all([
        client.getQaRules({ scope: 'all' }),
        client.getQaSummary()
      ])
      await prisma.bimQaSnapshot.create({
        data: {
          projectId,
          scope: 'all',
          ruleCount: rules?.total_count || rules?.count || 0,
          rulesSnapshot: rules?.rules || [],
          source: 'gateway'
        }
      })
      await prisma.bimQaRun.create({
        data: {
          projectId,
          runId: summary?.run_id || `sync-${Date.now()}`,
          scope: 'all',
          modelId: summary?.model_id || '',
          rulesExecuted: summary?.total_rules || 0,
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
      return NextResponse.json({ synced: true, rules, summary })
    }

    // Default: create local workflow record
    const raw = body
    const { projectId, ...data } = raw
    const created = await prisma.bimVerifyCheck.create({
      data: { ...data, projectId },
      include: { project: { select: { name: true } } }
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return errorResponse(e, req)}
}
