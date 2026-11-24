import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function unavailable() {
  return NextResponse.json({
    ok: false,
    code: 'REVIT_BRIDGE_NOT_IMPLEMENTED',
    error: 'Live Revit schedules are unavailable because no verified Revit bridge adapter is configured. No export file was created.',
  }, { status: 503 });
}

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  return unavailable();
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;
  return unavailable();
}
