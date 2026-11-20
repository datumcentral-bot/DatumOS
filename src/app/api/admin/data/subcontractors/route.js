import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard, ROLES } from '@/lib/auth';
import { errorResponse } from "@/lib/api-errors";

export async function POST(req) {
  const denied = await guard(ROLES.DIRECTOR);
  if (denied) return denied;
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
    return errorResponse(e, req)
  }
}
