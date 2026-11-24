import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES, getClientEntityId } from "@/lib/auth";

// SECURITY FIX (2026-10-10): this route had no in-handler authorisation.
//
// Verified defect before the fix: with a real CLIENT session, `GET /api/invoices`
// returned EVERY invoice in the database, including other clients' records, and
// the `clientId` query parameter let a caller ask for any client's data by ID.
// The edge middleware only proves that *someone* is logged in; it does not scope
// records to a tenant.
//
// The fix below:
//   * any authenticated role may call the route (no `requiredRoles`), so the
//     portal UI keeps working;
//   * a CLIENT session is forced to its OWN clientId, and a caller-supplied
//     clientId is ignored — it cannot be used to override ownership;
//   * staff roles (DIRECTOR / MEMBER / REVIT) see the full set as before.
export const dynamic = "force-dynamic";

function scopeForClient(session) {
  const role = session?.user?.role;
  if (role === ROLES.CLIENT) {
    const clientId = getClientEntityId(session);
    // No linked client on the session means no client data is visible at all.
    return clientId ? { clientId } : { clientId: "__NONE__" };
  }
  return null;
}

const GET = withAuth(async (req, _ctx, session) => {
  if (![ROLES.DIRECTOR, ROLES.MEMBER, ROLES.CLIENT].includes(session?.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = {};
  const clientScope = scopeForClient(session);
  if (clientScope) {
    Object.assign(where, clientScope);
  } else {
    // Staff callers may still filter, but only because they may see everything.
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    if (clientId) where.clientId = clientId;
    if (projectId) where.projectId = projectId;
  }
  if (status) where.status = status;

  const data = await prisma.invoice.findMany({
    where,
    include: { client: { select: { companyName: true } }, project: { select: { name: true, code: true } } },
    orderBy: { issueDate: "desc" },
  });
  return NextResponse.json(data);
});

const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const data = await prisma.invoice.create({
      data: body,
      include: { client: { select: { companyName: true } }, project: { select: { name: true } } },
    });
    return NextResponse.json(data, { status: 201 });
  },
  // Only staff may raise an invoice. A CLIENT cannot create billing records.
  ROLES.DIRECTOR,
  ROLES.MEMBER
);

export { GET, POST };