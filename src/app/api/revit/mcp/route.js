import { NextResponse } from 'next/server';
import { guard } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";
import { broadcast } from '@/lib/broadcast';

let mcpServerState = {
  status: 'STOPPED',
  port: 8081,
  host: 'localhost',
  startedAt: null,
  clientId: null,
};

export const dynamic = "force-dynamic";

export async function GET(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'status') {
      return NextResponse.json(mcpServerState);
    }

    return NextResponse.json({
      server: mcpServerState,
      endpoints: {
        health: '/revit/mcp/health',
        start: '/revit/mcp/start',
        stop: '/revit/mcp/stop',
        elements: '/revit/mcp/elements',
        commands: '/revit/mcp/commands',
      },
    });
  } catch (e) {
    return errorResponse(e, req);
  }
}

export async function POST(req) {
  const denied = await guard('DIRECTOR');
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'start') {
      mcpServerState.status = 'STARTING';
      mcpServerState.startedAt = new Date().toISOString();
      broadcast('revit', 'mcp_started', { port: 8081 }, 'System');
      return NextResponse.json({
        ok: true,
        message: 'MCP Server starting on http://localhost:8081',
        server: mcpServerState,
      });
    }

    if (action === 'stop') {
      mcpServerState.status = 'STOPPED';
      mcpServerState.startedAt = null;
      broadcast('revit', 'mcp_stopped', {}, 'System');
      return NextResponse.json({
        ok: true,
        message: 'MCP Server stopped',
        server: mcpServerState,
      });
    }

    if (action === 'connect') {
      mcpServerState.clientId = 'web-director-' + Date.now();
      broadcast('revit', 'mcp_connected', { clientId: mcpServerState.clientId }, 'System');
      return NextResponse.json({
        ok: true,
        message: 'Connected to Revit MCP Server',
        clientId: mcpServerState.clientId,
      });
    }

    if (action === 'disconnect') {
      mcpServerState.clientId = null;
      broadcast('revit', 'mcp_disconnected', {}, 'System');
      return NextResponse.json({ ok: true, message: 'Disconnected from Revit MCP Server' });
    }

    return NextResponse.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (e) {
    return errorResponse(e, req);
  }
}
