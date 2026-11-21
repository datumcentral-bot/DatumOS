import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
import { broadcast } from '@/lib/broadcast';

const auditTrail = [
  {
    timestamp: '2026-09-09T03:37:38.403312',
    action: 'create_container',
    user: 'test@test.com',
    details: 'Container BIM-001 created at stage WIP',
  },
  {
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    action: 'update_container',
    user: 'director@datumbim.com',
    details: 'Container BIM-001 updated to stage Shared',
  },
  {
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    action: 'transition',
    user: 'director@datumbim.com',
    details: 'Container BIM-001 moved from WIP to Shared',
  },
  {
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    action: 'publish_container',
    user: 'director@datumbim.com',
    details: 'Container BIM-001 published at stage Published',
  },
  {
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'create_container',
    user: 'ahmed@datum-bim.com',
    details: 'Container BIM-002 created at stage WIP',
  },
  {
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    action: 'update_container',
    user: 'khalid@bagc.ae',
    details: 'Container BIM-002 updated at stage Shared',
  },
];

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get('containerId');
    const action = searchParams.get('action');
    const user = searchParams.get('user');

    let filtered = auditTrail;
    if (containerId) filtered = filtered.filter(a => a.details.includes(containerId));
    if (action) filtered = filtered.filter(a => a.action === action);
    if (user) filtered = filtered.filter(a => a.user === user);

    return NextResponse.json({
      total: filtered.length,
      audit: filtered,
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const body = await req.json();
    const { action, user, details, containerId } = body;

    if (!action || !user || !details) {
      return NextResponse.json({ error: "action, user, details are required" }, { status: 400 });
    }

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      user,
      details: containerId ? `Container ${containerId} ${details}` : details,
    };

    auditTrail.push(auditEntry);

    broadcast('bim', 'audit_logged', auditEntry, user);

    return NextResponse.json({
      ok: true,
      audit: auditEntry,
    }, { status: 201 });
  } catch (e) {
    return errorResponse(e, req);
  }
}
