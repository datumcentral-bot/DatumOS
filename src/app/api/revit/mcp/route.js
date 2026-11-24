import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

function bridgeStatus() {
  return {
    status: 'UNVERIFIED',
    configured: Boolean(process.env.DATUM_REVIT_BRIDGE_URL),
    host: null,
    port: 8081,
    connected: false,
    message: 'A configured bridge URL is not proof of a live Revit connection. Health verification requires the Revit bridge agent.',
  };
}

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  try {
    return NextResponse.json({
      ok: true,
      server: bridgeStatus(),
      endpoints: {
        health: '/api/revit/mcp?action=status',
        start: null,
        stop: null,
        elements: '/api/revit/element',
        commands: null,
      },
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  return NextResponse.json({
    ok: false,
    code: 'REVIT_BRIDGE_NOT_IMPLEMENTED',
    error: 'No verified Revit bridge command adapter is configured. No start, stop, connect, or disconnect action was performed.',
    server: bridgeStatus(),
  }, { status: 503 });
}
