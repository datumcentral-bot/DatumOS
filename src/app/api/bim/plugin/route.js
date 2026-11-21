import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
import { broadcast } from '@/lib/broadcast';

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'plugins') {
      return NextResponse.json({
        plugins: [
          {
            id: 'bim_plugin_001',
            name: 'BIM Plugin',
            version: '1.0.0',
            description: 'BIM Operations - ISO 19650 Compliance',
            tools: [
              { name: 'iso19650_compliance', description: 'Check ISO 19650 compliance for a container', parameters: ['container_id'] },
              { name: 'create_container', description: 'Create new ISO 19650 information container', parameters: ['name', 'discipline', 'phase', 'metadata'] },
              { name: 'audit_trail', description: 'Get audit trail for a container', parameters: ['container_id'] },
            ],
            status: 'ACTIVE',
          },
        ],
      });
    }

    if (action === 'audit_trail') {
      return NextResponse.json({
        audit: [
          { timestamp: '2026-09-09T03:37:38.403312', action: 'create_container', user: 'test@test.com', details: 'Container BIM-001 created at stage WIP' },
        ],
      });
    }

    return NextResponse.json({
      name: 'BIM Plugin',
      version: '1.0.0',
      status: 'ACTIVE',
      capabilities: ['iso19650_compliance', 'create_container', 'audit_trail'],
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
    const { action, containerId, name, discipline, phase, metadata } = body;

    if (action === 'create_container') {
      if (!name || !discipline || !phase || !metadata) {
        return NextResponse.json({ error: "name, discipline, phase, metadata are required" }, { status: 400 });
      }

      const newContainer = {
        id: 'BIM-' + Date.now(),
        name,
        stage: 'WIP',
        discipline,
        phase,
        metadata,
        created: new Date().toISOString(),
      };

      broadcast('bim_plugin', 'container_created', newContainer, 'System');

      return NextResponse.json({
        ok: true,
        container: newContainer,
      });
    }

    if (action === 'audit_trail' && containerId) {
      return NextResponse.json({
        containerId,
        audit: [
          { timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'create_container', user: 'system@datum.com', details: `Container ${containerId} created at stage WIP` },
          { timestamp: new Date(Date.now() - 43200000).toISOString(), action: 'transition', user: 'director@datumbim.com', details: `Container ${containerId} moved from WIP to Shared` },
        ],
      });
    }

    return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 });
  } catch (e) {
    return errorResponse(e, req);
  }
}
