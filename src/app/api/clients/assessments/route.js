import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const b = await req.json();
    const d = Number(b.scoreDelivery) || 0;
    const c = Number(b.scoreComms) || 0;
    const v = Number(b.scoreValue) || 0;
    const a = await prisma.clientAssessment.create({
      data: {
        clientId: b.clientId,
        period: b.period,
        scoreDelivery: d,
        scoreComms: c,
        scoreValue: v,
        scoreOverall: Math.round((d + c + v) / 3),
        strengths: b.strengths || null,
        concerns: b.concerns || null,
        action: b.action || null,
        assessedBy: b.assessedBy || "Director",
      },
    });
    return NextResponse.json(a, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.clientAssessment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
