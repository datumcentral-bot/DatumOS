import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const where = category ? { category } : {};
    const settings = await prisma.systemSettings.findMany({ where, orderBy: { key: "asc" } });
    // Convert to key-value map
    const map = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({ settings, map });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json(); // { key: value, ... }
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), category: "general" },
        })
      );
    }
    await Promise.all(updates);
    return NextResponse.json({ success: true, updated: Object.keys(body).length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
