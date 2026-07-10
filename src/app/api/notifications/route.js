import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastAll } from "@/lib/broadcast";

export async function GET(req) {
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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  // Mark all as read
  try {
    await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}