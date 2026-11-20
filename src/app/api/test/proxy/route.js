import { NextResponse } from 'next/server'
import { request } from 'undici'
import { guard } from '@/lib/auth'
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// SECURITY (2026-10-10): this endpoint forwards to internal
// infrastructure (DCORTEX_API_URL) and is a manual testing tool —
// no application code in src/ calls it. It previously accepted any
// staff session. It is now restricted to DIRECTOR sessions and is
// disabled in production unless explicitly enabled with
// DATUM_TEST_PROXY=1, so it cannot be used as an open internal
// proxy on a deployed build.

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  if (process.env.NODE_ENV === 'production' && process.env.DATUM_TEST_PROXY !== '1') {
    return NextResponse.json({ error: 'Test proxy disabled' }, { status: 503 });
  }
  try {
    const { searchParams } = new URL(req.url)
    const test = searchParams.get('test')
    // Use actual machine IP instead of 127.0.0.1
    const base = process.env.DCORTEX_API_URL || 'http://172.22.16.1:8799'

    if (test === 'direct') {
      const { statusCode, body } = await request(`${base}/health`, { method: 'GET', headers: { accept: 'application/json' } })
      const data = await body.json()
      return NextResponse.json({ health: data, used_base: base })
    }

    if (test === 'qa') {
      const [rulesRes, summaryRes] = await Promise.all([
        request(`${base}/bim/qa/rules?scope=all`, { method: 'GET', headers: { accept: 'application/json' } }),
        request(`${base}/bim/qa/summary`, { method: 'GET', headers: { accept: 'application/json' } })
      ])
      const [rules, summary] = await Promise.all([rulesRes.body.json(), summaryRes.body.json()])
      return NextResponse.json({ rules, summary })
    }

    if (test === 'clash') {
      const [findingsRes, summaryRes] = await Promise.all([
        request(`${base}/bim/clash/findings`, { method: 'GET', headers: { accept: 'application/json' } }),
        request(`${base}/bim/clash/summary`, { method: 'GET', headers: { accept: 'application/json' } })
      ])
      const [findings, summary] = await Promise.all([findingsRes.body.json(), summaryRes.body.json()])
      return NextResponse.json({ findings, summary })
    }

    return NextResponse.json({ error: 'test param required' }, { status: 400 })
  } catch (e) {
    return errorResponse(e, req)}
}
