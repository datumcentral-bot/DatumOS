import { NextResponse } from "next/server";
import { withAuth, ROLES } from "@/lib/auth";
import { getDcortexClient, DcortexError } from "@/lib/dcortexClient";
import { errorResponse } from "@/lib/api-errors";

// DN013: DatumOS <-> gateway agent-task execution chain.
// GET /api/gateway-tasks -> CortexOrchestrator-dispatched jobs list (/ai/tasks)
// (DIRECTOR only — agent task execution panel lives in the director portal).
// Mirrors the /api/gateway-approvals relay pattern (canonical dcortex client).

const GET = withAuth(async (req, ctx, session) => {
  try {
    const client = await getDcortexClient(session);
    const data = await client.request("/ai/tasks");
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    if (err instanceof DcortexError) {
      return errorResponse(err, req)
    }
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}, ROLES.DIRECTOR);

export { GET };