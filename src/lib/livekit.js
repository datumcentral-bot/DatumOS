// src/lib/livekit.js — server-side LiveKit helpers.
//
// LiveKit access tokens are standard HS256 JWTs, so we build them with
// Node's built-in crypto (no extra dependency). The API key is the issuer
// (iss) and the API secret is the HMAC key. The real LIVEKIT_API_KEY /
// LIVEKIT_API_SECRET are supplied at runtime via the environment (Vercel
// env vars, or the secure drop file for the local instance) — never
// committed to the repo.
import crypto from 'crypto'

export function getLiveKitConfig() {
  const url = process.env.LIVEKIT_URL || ''
  const apiKey = process.env.LIVEKIT_API_KEY || ''
  const apiSecret = process.env.LIVEKIT_API_SECRET || ''
  return {
    url,
    apiKey,
    apiSecret,
    configured: Boolean(url && apiKey && apiSecret),
  }
}

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

// Build a short-lived LiveKit access token (JWT) for a room.
// https://docs.livekit.io/reference/server/authentication
export function createLiveKitToken({
  identity,
  name,
  room,
  metadata,
  canPublish = true,
  canSubscribe = true,
  canPublishScreen = true,
  canPublishData = true,
  ttlSec = 3600,
}) {
  const { apiKey, apiSecret } = getLiveKitConfig()
  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit is not configured (LIVEKIT_API_KEY / LIVEKIT_API_SECRET missing)')
  }
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: apiKey,
    nbf: now,
    exp: now + ttlSec,
    // LiveKit reads the participant identity from the standard JWT `sub`
    // (subject) claim — a top-level `identity` claim is ignored by the
    // server and yields "identity cannot be empty" (400) on /rtc/v1.
    sub: String(identity),
    name: name || String(identity),
    video: {
      room: String(room),
      roomJoin: true,
      canPublish,
      canSubscribe,
      canPublishScreen,
      canPublishData,
    },
  }
  if (metadata) payload.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata)
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`
  // digest('base64') already returns a base64 string — convert it to
  // base64url by swapping chars. Do NOT re-encode through Buffer.from(),
  // which would double-encode the signature.
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${signingInput}.${signature}`
}
