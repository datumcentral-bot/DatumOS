import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function unavailable() {
  return NextResponse.json({
    ok: false,
    code: 'REVIT_BRIDGE_NOT_IMPLEMENTED',
    error: 'Live Revit element access is unavailable because no verified Revit bridge adapter is configured. No element was read or changed.',
  }, { status: 503 });
}

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  if (!searchParams.get('elementId')) {
    return NextResponse.json({ error: 'elementId is required' }, { status: 400 });
  }
  return unavailable();
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  return unavailable();
}
