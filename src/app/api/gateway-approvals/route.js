import { NextResponse } from "next/server";
import { withAuth, ROLES } from "@/lib/auth";
import { getDcortexClient, DcortexError } from "@/lib/dcortexClient";
import { errorResponse } from "@/lib/api-errors";

// DN013: DatumOS <-> gateway approval decision chain.
// GET  /api/gateway-approvals            -> pending gateway approvals (DIRECTOR | CLIENT)
// POST /api/gateway-approvals            -> { approvalId, decision: "approve" | "reject" } (DIRECTOR only)
// POST /api/gateway-approvals?refresh=1  -> force token refresh (no body) (DIRECTOR only)

const GET = withAuth(async (req, ctx, session) => {
  try {
    const client = await getDcortexClient(session);
    const data = await client.request("/ai/approvals");
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    if (err instanceof DcortexError) {
      return errorResponse(err, req)
    }
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}, ROLES.DIRECTOR, ROLES.CLIENT);

const POST = withAuth(async (req, ctx, session) => {
  try {
    const { searchParams } = new URL(req.url);
    let approvalId, decision;
    if (searchParams.has("refresh")) {
      // Token-refresh shortcut used by the approvals console after a decision.
      const client = await getDcortexClient(session);
      const data = await client.request("/ai/approvals");
      return NextResponse.json(Array.isArray(data) ? data : []);
    }
    const body = await req.json();
    approvalId = body.approvalId || body.approval_id;
    decision = body.decision;
    if (!approvalId || !["approve", "reject"].includes(decision)) {
      return NextResponse.json(
        { error: "approvalId + decision (approve|reject) required" },
        { status: 400 }
      );
    }
    const client = await getDcortexClient(session);
    const data = await client.request(
      `/ai/approvals/${encodeURIComponent(approvalId)}/${decision}`,
      "POST",
      { decided_by: session.user.name || session.user.username || "director" }
    );
    return NextResponse.json(data || { ok: true });
  } catch (err) {
    if (err instanceof DcortexError) {
      return errorResponse(err, req)
    }
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}, ROLES.DIRECTOR);

export { GET, POST };