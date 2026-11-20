/**
 * DCORTEX Proxy API Route
 *
 * Server-side catch-all proxy that forwards browser requests to the
 * DCORTEX gateway. The DCORTEX_DATUMOS_PROXY_SECRET and JWT bearer
 * tokens are handled entirely server-side — the browser only receives
 * JSON responses.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDcortexClient, DcortexError } from '@/lib/dcortexClient'
import { logError } from '@/lib/api-errors'

export const dynamic = "force-dynamic";

const RELAY_PATHS = [
  '/health',
  '/revit',
  '/ai',
  '/agents',
  '/nodes',
  '/bim',
  // Consumed by src/app/revit/page.js (ecosystem status + knowledge index)
  '/ecosystem',
  '/knowledge',
  // DATUMBOT AI 22-tool READ_ONLY registry (DN005). Server-side only; the
  // gateway exposes GET /datumbot/registry, GET /datumbot/tools/{name} and
  // POST /datumbot/tools/{name}/invoke. All 22 tools are C_READ / LOW risk
  // and read from the Revit bridge, so relaying them adds no write surface.
  '/datumbot',
  // Read-only evidence + audit relays (GET only, session-authenticated
  // server-side). Power the EVIDENCE & REPORTS and SECURITY & AUDIT panels.
  '/evidence',
  '/security',
  // ── Full Cortex module surface: link every remaining canonical
  // gateway router into DatumOS so the entire Cortex feature set is
  // reachable from one app. These are read relays (GET) behind the
  // same session gate; the gateway enforces its own auth + role checks
  // on the origin side. Modules: brand, website (growth), analytics,
  // delivery, commercial, enterprise (lifecycle), production,
  // consolidation — previously unreachable from DatumOS.
  '/brand',
  '/website',
  '/analytics',
  '/delivery',
  '/commercial',
  '/enterprise',
  '/production',
  '/consolidation',
]

export async function GET(request, { params }) {
  try {
    console.log('[dcortex-proxy] GET', new URL(request.url).pathname)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { path } = params
    const apiPath = '/' + path.join('/')
    console.log('[dcortex-proxy] API path:', safeApiPath(apiPath))

    if (!isRelayPath(apiPath)) {
      console.log('[dcortex-proxy] Unknown endpoint:', safeApiPath(apiPath))
      return Response.json({ error: 'Unknown endpoint' }, { status: 404 })
    }

    const client = await getDcortexClient(session)
    const url = new URL(request.url)
    const resp = await client.request(apiPath, 'GET', null, parseQuery(url.searchParams))

    return Response.json(resp)
  } catch (err) {
    logError(err, request, 'dcortex-proxy GET')
    return handleDcortexError(err)
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { path } = params
    const apiPath = '/' + path.join('/')

    if (apiPath === '/ai/chat') {
      const body = await request.json()
      const client = await getDcortexClient(session)
      const resp = await client.aiChat(body.messages, body.model, body.projectId)
      return Response.json(resp)
    }

    // DATUMBOT AI tool invocation (DN005). Every one of the 22 tools is
    // permission_class C_READ / risk LOW, and the gateway registry reports
    // read_only=true with canonical_tool_count == 22 write tools == 0, so
    // relaying these POSTs exposes no write surface. This mirrors the
    // Control Room's existing /api/datumbot/tools/{name}/invoke proxy and
    // keeps the same session gate as every other relayed path.
    if (apiPath.startsWith('/datumbot/') && isRelayPath(apiPath)) {
      let body = {}
      try {
        body = await request.json()
      } catch {
        body = {}
      }
      const client = await getDcortexClient(session)
      const resp = await client.request(apiPath, 'POST', body)
      return Response.json(resp)
    }

    return Response.json({ error: 'POST not supported for this endpoint' }, { status: 405 })
  } catch (err) {
    logError(err, request, 'dcortex-proxy POST')
    return handleDcortexError(err)
  }
}

function isRelayPath(apiPath) {
  return RELAY_PATHS.some((p) => apiPath === p || apiPath.startsWith(p + '/'))
}

// Log-safe rendering of caller-supplied path segments: bounded
// length and restricted charset, so arbitrary input cannot inject
// control characters into the structured log line.
function safeApiPath(apiPath) {
  return apiPath.slice(0, 120).replace(/[^\w/.-]/g, '_')
}

function parseQuery(searchParams) {
  const params = {}
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      if (!Array.isArray(params[key])) params[key] = [params[key]]
      params[key].push(value)
    } else {
      params[key] = value
    }
  }
  return params
}

function handleDcortexError(err) {
  if (err instanceof DcortexError) {
    const available = err.status !== 503
    return Response.json(
      { error: 'Request failed', available: available === false ? false : undefined },
      { status: err.status }
    )
  }
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
