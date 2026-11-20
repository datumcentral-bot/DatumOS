import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastAll } from "@/lib/broadcast";
import { guard } from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// SECURITY (2026-10-10): these three handlers previously had no
// authorisation at all — any staff session (MEMBER/REVIT/DIRECTOR)
// could read every notification, broadcast an arbitrary notification
// to all connected clients, and mark every notification as read.
// The only caller in the application is the DIRECTOR notifications
// page (/director/notifications), so all three handlers are now
// DIRECTOR-only. The [id] sub-route was already guarded.

export async function GET(req) {
  const denied = await guard("DIRECTOR");
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const where = unreadOnly ? { read: false } : {};
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({ where: { read: false } });
    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function POST(req) {
  const denied = await guard("DIRECTOR");
  if (denied) return denied;
  try {
    const body = await req.json();
    const notif = await prisma.notification.create({
      data: {
        type: body.type || "general",
        title: body.title,
        message: body.message,
        link: body.link || null,
        userId: body.userId || null,
        read: false,
      },
    });
    // Broadcast to ALL connected clients so the bell icon updates everywhere
    broadcastAll('notification:new', notif);
    return NextResponse.json(notif, { status: 201 });
  } catch (e) {
    return errorResponse(e, req)
  }
}

export async function PATCH(req) {
  // Mark all as read
  const denied = await guard("DIRECTOR");
  if (denied) return denied;
  try {
    await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e, req)
  }
}
