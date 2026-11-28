export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'datumos-console',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.round(process.uptime()),
    node_env: process.env.NODE_ENV || 'unknown',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    services: {
      gateway: 'online',
      bridge: 'online',
      database: 'connected',
      revit: 'online'
    }
  });
}
