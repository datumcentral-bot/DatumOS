import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// GET /api/screenshare  -> list LIVE sessions (director viewer polls this)
export async function GET(req) {
  try {
    await requireRole("DIRECTOR", "MEMBER");
  } catch (err) {
    return errorResponse(err, req)
  }
  const sessions = await prisma.screenShareSession.findMany({
    where: { status: "LIVE" },
    orderBy: { startedAt: "desc" },
  });
  return NextResponse.json({ ok: true, sessions });
}

// POST /api/screenshare { hostName, hostRole, offer } -> host starts a session
export async function POST(req) {
  try {
    await requireRole("DIRECTOR", "MEMBER");
  } catch (err) {
    return errorResponse(err, req)
  }
  const body = await req.json().catch(() => ({}));
  const { hostName, hostRole, offer } = body;
  if (!hostName || !offer) return NextResponse.json({ ok: false, message: "hostName + offer required" }, { status: 400 });
  const session = await prisma.screenShareSession.create({
    data: { hostName, hostRole: hostRole || null, status: "LIVE", offer: JSON.stringify(offer), hostCandidates: "[]", viewerCandidates: "[]" },
  });
  await prisma.activityLog.create({
    data: { actor: hostName, action: "CREATED", entity: "ScreenShare", entityId: session.id, summary: `${hostName} started sharing their screen`, portal: "workspace" },
  });
  return NextResponse.json({ ok: true, id: session.id });
}