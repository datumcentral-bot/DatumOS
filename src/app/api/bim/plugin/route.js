import { NextResponse } from "next/server";
import { guard, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-errors";
import { broadcast } from "@/lib/broadcast";

export const dynamic = "force-dynamic";

const ENTITY = "BimInformationContainer";

export async function GET(req) {
  const denied = await guard("DIRECTOR");
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "plugins") {
      return NextResponse.json({
        plugins: [{
          id: "bim_plugin_001",
          name: "BIM Plugin",
          version: "1.1.0",
          description: "BIM Operations - ISO 19650 Information Container Management",
          tools: [
            { name: "create_container", description: "Create and persist an ISO 19650 information container", parameters: ["containerId", "projectId", "name", "discipline", "phase", "metadata"] },
            { name: "audit_trail", description: "Read the persisted audit trail for a container", parameters: ["containerId"] },
          ],
          status: "ACTIVE",
        }],
      });
    }

    if (action === "containers") {
      const projectId = searchParams.get("projectId");
      const containers = await prisma.bimInformationContainer.findMany({
        where: projectId ? { projectId } : {},
        include: { project: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ containers });
    }

    if (action === "audit_trail") {
      const containerId = (searchParams.get("containerId") || "").trim();
      if (!containerId) {
        return NextResponse.json({ error: "containerId is required" }, { status: 400 });
      }
      const container = await prisma.bimInformationContainer.findUnique({
        where: { containerId },
        select: { id: true, containerId: true },
      });
      if (!container) return NextResponse.json({ error: "Container not found" }, { status: 404 });

      const audit = await prisma.activityLog.findMany({
        where: { entity: ENTITY, entityId: container.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, actor: true, action: true, details: true, summary: true, createdAt: true },
      });
      return NextResponse.json({ containerId, audit });
    }

    return NextResponse.json({
      name: "BIM Plugin",
      version: "1.1.0",
      status: "ACTIVE",
      capabilities: ["create_container", "audit_trail"],
    });
  } catch (error) {
    return errorResponse(error, req);
  }
}

export async function POST(req) {
  const denied = await guard("DIRECTOR");
  if (denied) return denied;

  try {
    const body = await req.json();
    const containerId = typeof body?.containerId === "string" ? body.containerId.trim() : "";
    const projectId = typeof body?.projectId === "string" ? body.projectId.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const discipline = typeof body?.discipline === "string" ? body.discipline.trim() : "";
    const phase = typeof body?.phase === "string" ? body.phase.trim() : "";
    const metadata = body?.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata
      : {};

    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/.test(containerId)) {
      return NextResponse.json({ error: "containerId must be 3-64 characters using letters, numbers, dot, underscore or hyphen" }, { status: 400 });
    }
    if (name.length < 2 || name.length > 160 || discipline.length < 2 || discipline.length > 80 || phase.length < 1 || phase.length > 40) {
      return NextResponse.json({ error: "Valid name, discipline and phase are required" }, { status: 400 });
    }
    if (!projectId || projectId.length > 128) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (JSON.stringify(metadata).length > 10000) {
      return NextResponse.json({ error: "metadata must be smaller than 10 KB" }, { status: 400 });
    }

    const session = await getSession();
    const actor = session?.user?.email;
    if (!actor) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const container = await prisma.$transaction(async (tx) => {
      const created = await tx.bimInformationContainer.create({
        data: {
          containerId,
          projectId,
          name,
          discipline,
          phase,
          stage: "WIP",
          metadata,
          createdBy: actor,
        },
        include: { project: { select: { id: true, name: true, code: true } } },
      });

      await tx.activityLog.create({
        data: {
          actor,
          action: "CREATE",
          entity: ENTITY,
          entityId: created.id,
          details: JSON.stringify({ containerId, projectId, name, discipline, phase, stage: "WIP" }),
          summary: `Created BIM information container ${containerId}`,
          portal: "BIM",
        },
      });
      return created;
    });

    try {
      broadcast("bim_plugin", "container_created", container, actor);
    } catch {
      // The committed database record and audit entry remain authoritative.
    }

    return NextResponse.json({ ok: true, container }, { status: 201 });
  } catch (error) {
    return errorResponse(error, req);
  }
}
