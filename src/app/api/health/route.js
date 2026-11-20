// Machine-readable health contract for the DatumOS console.
// Consumed by DATUM CORTEX dcg_integration health probe (127.0.0.1:3010).
// Liveness only — no secrets, no database round-trip, no user data.

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'datumos-console',
    uptime_seconds: Math.round(process.uptime()),
    node_env: process.env.NODE_ENV || 'unknown',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  });
}
