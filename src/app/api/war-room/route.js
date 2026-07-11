import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/broadcast";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const projectId = searchParams.get("projectId");
    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (projectId) where.projectId = projectId;

    const incidents = await prisma.warRoomIncident.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, code: true, name: true } },
      },
      orderBy: [
        { severity: "desc" },
        { reportedAt: "desc" },
      ],
    });

    const stats = {
      total: incidents.length,
      open: incidents.filter((i) => i.status === "OPEN").length,
      investigating: incidents.filter((i) => i.status === "INVESTIGATING").length,
      resolved: incidents.filter((i) => i.status === "RESOLVED").length,
      critical: incidents.filter((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED").length,
    };

    const projects = await prisma.project.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { name: "asc" },
    });

    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ incidents, stats, projects, users });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const incident = await prisma.warRoomIncident.create({
      data: {
        title: body.title,
        description: body.description || null,
        severity: body.severity || "MEDIUM",
        status: body.status || "OPEN",
        assigneeId: body.assigneeId || null,
        projectId: body.projectId || null,
        source: body.source || "WAR_ROOM",
        resolution: body.resolution || null,
      },
      include: {
        assignee: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, code: true, name: true } },
      },
    });
    broadcast("warroom", "created", incident, "Director");
    return NextResponse.json(incident, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const incident = await prisma.warRoomIncident.update({
      where: { id },
      data: {
        ...rest,
        resolvedAt: rest.status === "RESOLVED" ? new Date() : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, code: true, name: true } },
      },
    });
    broadcast("warroom", "updated", incident, "Director");
    return NextResponse.json(incident);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.warRoomIncident.delete({ where: { id } });
    broadcast("warroom", "deleted", { id }, "Director");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
