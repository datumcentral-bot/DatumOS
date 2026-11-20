// GET /api/livekit/health -> probe the configured LiveKit server.
// Returns 503 with configured:false when the deployment has no LiveKit
// env (e.g. Vercel before the key is added) so the UI can degrade gracefully.
import { getLiveKitConfig } from '@/lib/livekit'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cfg = getLiveKitConfig()
  if (!cfg.configured) {
    return NextResponse.json(
      { ok: false, configured: false, message: 'LiveKit not configured on this deployment' },
      { status: 503 }
    )
  }
  // Normalize the WebSocket URL to HTTP(S) for the health probe
  // (fetch only speaks http/https, not ws/wss).
  const base = cfg.url
    .replace(/\/$/, '')
    .replace(/^ws:/, 'http:')
    .replace(/^wss:/, 'https:')
  // LiveKit answers GET / with "OK"; some versions also expose
  // /health. Probe both — any 2xx means the server is reachable.
  for (const p of ['/health', '/']) {
    try {
      const res = await fetch(base + p, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const body = await res.json().catch(() => null)
        return NextResponse.json({ ok: true, configured: true, status: res.status, path: p, livekit: body })
      }
    } catch {
      // try the next path
    }
  }
  return NextResponse.json({ ok: false, configured: true, error: 'LiveKit server unreachable' }, { status: 503 })
}
