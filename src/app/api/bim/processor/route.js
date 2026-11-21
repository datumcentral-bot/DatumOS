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
    const containerId = searchParams.get('containerId');

    if (action === 'compliance' && containerId) {
      return NextResponse.json({
        containerId,
        stage: 'Shared',
        complianceScore: 85,
        issues: [
          { rule: 'WIP-01', severity: 'Medium', description: 'Missing discipline designation in filename' },
          { rule: 'BIM-03', severity: 'Low', description: 'Missing author metadata' },
        ],
        recommendations: [
          'Add discipline designation to filename',
          'Add author metadata to container properties',
        ],
      });
    }

    if (action === 'containers') {
      return NextResponse.json({
        containers: [
          { id: 'BIM-001', name: 'Architectural Model', stage: 'Published', discipline: 'Architecture', phase: 'P1', active: true },
          { id: 'BIM-002', name: 'Structural Model', stage: 'Shared', discipline: 'Structure', phase: 'P1', active: true },
          { id: 'BIM-003', name: 'MEP Model', stage: 'WIP', discipline: 'MEP', phase: 'P1', active: true },
        ],
      });
    }

    return NextResponse.json({
      capabilities: ['iso19650_compliance', 'create_container', 'audit_trail'],
      status: 'READY',
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

      broadcast('bim', 'container_created', newContainer, 'System');

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
