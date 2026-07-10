import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const sub = await prisma.subcontractor.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        specialty: body.specialty || null,
        country: body.country || null,
        active: true,
      },
    });
    return NextResponse.json(sub, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
