import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIRECTOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const portal = searchParams.get("portal");
  const entity = searchParams.get("entity");
  const limit = parseInt(searchParams.get("limit") || "100");

  try {
    const where = {};
    if (portal) where.portal = portal;
    if (entity) where.entity = entity;

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
