// POST /api/livekit/token  { room, canPublishScreen? }
// Issues a short-lived LiveKit access token to the authenticated session.
// The token is signed server-side with the API secret, which never leaves
// the server — the browser only receives the signed JWT.
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createLiveKitToken, getLiveKitConfig } from '@/lib/livekit'
import { NextResponse } from 'next/server'
import { errorResponse } from "@/lib/api-errors";

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const cfg = getLiveKitConfig()
    if (!cfg.configured) {
      return NextResponse.json({ error: 'LiveKit not configured on this deployment' }, { status: 503 })
    }
    const body = await req.json().catch(() => ({}))
    const room = body.room || 'default'
    // Identity: stable per-user identifier. Email is always present for the
    // credentials provider; fall back to name.
    const identity = session.user.email || session.user.name || 'anon'
    const name = session.user.name || session.user.email || identity
    const canPublishScreen = body.canPublishScreen !== false
    // Pass role/entity through as token metadata so room-level authorization
    // (e.g. who may publish a screen) can be enforced by the agent/room logic.
    const metadata = {
      role: session.user.role || null,
      linkedEntityId: session.user.linkedEntityId || null,
    }
    const token = createLiveKitToken({ identity, name, room, metadata, canPublishScreen })
    return NextResponse.json({ ok: true, url: cfg.url, token, identity, name, room })
  } catch (err) {
    return errorResponse(err, req)}
}
