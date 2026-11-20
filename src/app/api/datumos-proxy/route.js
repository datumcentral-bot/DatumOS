import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

/**
 * DECISION: HARDEN (2026-10-10). Not removed, because "no in-repo caller" is not
 * proof that no external caller exists — a desktop or agent service may call it.
 *
 * Findings before hardening:
 *   - The route accepted an arbitrary `path` and forwarded it to the gateway,
 *     including absolute URLs, which made it an open relay / SSRF surface.
 *   - It performed no authentication of its own; it relied entirely on the edge
 *     middleware, which previously allowed all of /api/* publicly.
 *   - No application code in src/ calls it; the only textual match was the
 *     unrelated header name `x-datumos-proxy-secret`.
 *   - The local gateway (127.0.0.1:8799) was not listening at review time.
 *
 * Controls now applied:
 *   1. A session is required (middleware denies anonymous callers).
 *   2. `path` must be a RELATIVE path beginning with a single "/". Absolute
 *      URLs, protocol-relative URLs and traversal sequences are rejected, so the
 *      relay can no longer be pointed at an arbitrary host.
 *   3. The path must match the allowlist below.
 *   4. When DCORTEX_DATUMOS_PROXY_SECRET is configured, a matching
 *      `x-datumos-proxy-secret` header is required. If the variable is unset the
 *      route fails closed rather than serving the gateway unauthenticated.
 */
const ALLOWED_PATH_PREFIXES = [
  '/health',
  '/nodes',
  '/ai/chat',
  '/ai/agents',
  '/revit/health',
  '/bim/engineering',
];

const PROXY_SECRET = process.env.DCORTEX_DATUMOS_PROXY_SECRET;

/** Validate a caller-supplied target path. Returns the safe path, or null. */
function resolveTargetPath(raw) {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 300) return null;
  // Must be relative. Reject protocol-relative ("//host") and absolute URLs.
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  if (/^\s*https?:/i.test(raw)) return null;
  // Reject traversal and encoded traversal.
  if (raw.includes('..') || /%2e%2e/i.test(raw)) return null;
  // Reject userinfo, which can smuggle a different authority.
  if (raw.includes('@')) return null;
  const normalised = raw.split('?')[0];
  if (!ALLOWED_PATH_PREFIXES.some((p) => normalised === p || normalised.startsWith(p + '/'))) {
    return null;
  }
  return raw;
}

function authorise(request) {
  // Fail closed. The previous version allowed every caller through
  // when DCORTEX_DATUMOS_PROXY_SECRET was unset — the comment above
  // claimed fail-closed but the code failed open. Without a configured
  // secret the gateway is not served at all.
  if (!PROXY_SECRET) {
    return NextResponse.json({ error: 'Proxy not configured' }, { status: 503 });
  }
  const supplied = request.headers.get('x-datumos-proxy-secret');
  if (!supplied || supplied !== PROXY_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

// Use createRequire to bypass Next.js webpack shims for native Node.js modules.
// In Next.js's bundled environment, `import http from 'http'` may get intercepted
// by webpack polyfills that don't work correctly for server-side HTTP requests.
// createRequire ensures we get the real Node.js http module.
const require = createRequire(import.meta.url);
const http = require('http');

const GATEWAY_URL = process.env.DCORTEX_GATEWAY_URL || 'http://127.0.0.1:8799';

async function proxyRequest(request, path) {
    const targetUrl = new URL(path, GATEWAY_URL);
    const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname + targetUrl.search,
        method: request.method,
        headers: {
            ...Object.fromEntries(request.headers),
            host: targetUrl.host,
        },
    };

    // Remove headers that can cause issues
    delete options.headers['content-length'];

    return new Promise((resolve, reject) => {
        const proxyReq = http.request(options, (proxyRes) => {
            const chunks = [];
            proxyRes.on('data', (chunk) => chunks.push(chunk));
            proxyRes.on('end', () => {
                const body = Buffer.concat(chunks);
                const headers = {};
                Object.entries(proxyRes.headers).forEach(([key, value]) => {
                    if (value !== undefined) {
                        headers[key] = value;
                }
                });
                resolve(new NextResponse(body, {
                    status: proxyRes.statusCode,
                    headers,
                }));
            });
        });

        proxyReq.on('error', () => {
            // Redacted: the underlying error can carry gateway
            // host details; only the allowlisted relative path
            // is logged, and no error detail reaches the client.
            console.error('[api] gateway proxy error', { path });
            resolve(NextResponse.json(
                { error: 'Gateway unavailable' },
                { status: 502 }
            ));
        });

        proxyReq.setTimeout(30000, () => {
            proxyReq.destroy();
            resolve(NextResponse.json(
                { error: 'Gateway timeout' },
                { status: 504 }
            ));
        });

        // Forward request body
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            request.body?.pipe(proxyReq);
        } else {
            proxyReq.end();
        }
    });
}

export async function GET(request) { try {
  const denied = authorise(request);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('path');
    if (!raw) {
        return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
    }
    const path = resolveTargetPath(raw);
    if (!path) {
        return NextResponse.json(
            { error: 'Path not allowed. This proxy only forwards a fixed allowlist of gateway endpoints.' },
            { status: 400 }
        );
    }
    return proxyRequest(request, path);
 } catch (err) { return errorResponse(err, request); }}

export async function POST(request) { try {
  const denied = authorise(request);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('path');
    if (!raw) {
        return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
    }
    const path = resolveTargetPath(raw);
    if (!path) {
        return NextResponse.json(
            { error: 'Path not allowed. This proxy only forwards a fixed allowlist of gateway endpoints.' },
            { status: 400 }
        );
    }
    return proxyRequest(request, path);
 } catch (err) { return errorResponse(err, request); }}
