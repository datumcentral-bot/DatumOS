import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES, projectScopeWhere } from "@/lib/auth";

// SECURITY FIX (2026-10-10): no in-handler authorisation previously.
// Same class of defect as /api/invoices — the edge middleware proved only that
// a session existed, so any authenticated role could read every project, and the
// `clientId` query parameter allowed asking for another tenant's project.
//
// A CLIENT session is now forced to its own clientId and cannot override it.
export const dynamic = "force-dynamic";

const GET = withAuth(async (req, _ctx, session) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  // Enforce role-based record scope at the data layer:
  // DIRECTOR = all projects; MEMBER = assigned projects only;
  // CLIENT = own tenant only; REVIT = no general project-list access.
  const where = { ...projectScopeWhere(session) };

  // Only Directors may broaden/filter the portfolio by client ID.
  if (session?.user?.role === ROLES.DIRECTOR) {
    const clientId = searchParams.get("clientId");
    if (clientId) where.clientId = clientId;
  }
  if (status) where.status = status;

  const data = await prisma.project.findMany({
    where,
    include: {
      client: { select: { companyName: true } },
      assignments: { include: { user: { select: { name: true, avatarHue: true } } } },
      _count: { select: { tasks: true, milestones: true, cdeDocs: true, clashDetections: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}, ROLES.DIRECTOR, ROLES.MEMBER);

const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const { assignments, divisions, ...rest } = body;
    const data = await prisma.project.create({
      data: {
        ...rest,
        assignments: assignments ? { create: assignments } : undefined,
        divisions: divisions ? { create: divisions } : undefined,
      },
      include: { client: { select: { companyName: true } } },
    });
    return NextResponse.json(data, { status: 201 });
  },
  // Staff only. A CLIENT cannot create projects.
  ROLES.DIRECTOR,
  ROLES.MEMBER
);

export { GET, POST };