import { NextResponse } from "next/server";
import { withAuth, ROLES } from "@/lib/auth";
import { getDcortexClient, DcortexError } from "@/lib/dcortexClient";
import { errorResponse } from "@/lib/api-errors";

// DN017: DatumOS evidence browser -> gateway /evidence (read-only index).
// GET  /api/gateway-evidence          -> evidence pack/file index (DIRECTOR | CLIENT)
// GET  /api/gateway-evidence?pack=<n> -> file listing for one pack (DIRECTOR | CLIENT)

const GET = withAuth(async (req, ctx, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const pack = searchParams.get("pack");
    const client = await getDcortexClient(session);
    const data = pack
      ? await client.request("/evidence/pack", "GET", null, { name: pack })
      : await client.request("/evidence");
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof DcortexError) {
      return errorResponse(err, req)
    }
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}, ROLES.DIRECTOR, ROLES.CLIENT);

export { GET };