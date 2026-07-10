/**
 * GET /api/client — returns the client's own data (projects, milestones, docs, approvals, messages).
 * CLIENT: scoped to their linked Client.id
 * DIRECTOR: can pass ?clientId=xxx to view any client's data
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ROLES, getClientEntityId } from "@/lib/auth";

export async function GET(req) {
  let session;
  try {
    session = await requireAuth();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  const { searchParams } = new URL(req.url);
  let clientId;

  if (session.user.role === ROLES.DIRECTOR) {
    // Director can query any client
    clientId = searchParams.get("clientId");
    if (!clientId) {
      // Return all clients summary
      const clients = await prisma.client.findMany({
        include: { _count: { select: { projects: true } } },
        orderBy: { companyName: "asc" },
      });
      return NextResponse.json({ ok: true, clients });
    }
  } else if (session.user.role === ROLES.CLIENT) {
    clientId = getClientEntityId(session);
    if (!clientId) return NextResponse.json({ error: "No client linked to this account" }, { status: 403 });
  } else {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const [client, projects, approvals, messages] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.project.findMany({
      where: { clientId },
      include: {
        milestones: { orderBy: { orderIndex: "asc" } },
        documents: {
          where: { clientVisible: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        statusReports: { orderBy: { weekOf: "desc" }, take: 5 },
        _count: { select: { tasks: true, clashes: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.approval.findMany({
      where: { project: { clientId } },
      include: { document: true, project: { select: { code: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.clientMessage.findMany({
      where: { project: { clientId } },
      include: { project: { select: { code: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  return NextResponse.json({ ok: true, client, projects, approvals, messages });
}
