import { NextResponse } from "next/server";
import { withAuth, ROLES } from "@/lib/auth";
import { getDcortexClient, DcortexError } from "@/lib/dcortexClient";
import { errorResponse } from "@/lib/api-errors";

// DN017: DatumOS <-> gateway evidence-governance linkage.
// GET /api/gateway-audit -> gateway /security/audit events (DIRECTOR only)
// Surfaces governance/audit events inside the evidence console as a
// linkage tab, mirroring the gateway-approvals / gateway-evidence relays.

const GET = withAuth(async (req, ctx, session) => {
  try {
    const client = await getDcortexClient(session);
    const data = await client.request("/security/audit");
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    if (err instanceof DcortexError) {
      return errorResponse(err, req)
    }
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}, ROLES.DIRECTOR);

export { GET };