import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GET = withAuth(async () => {
  const activities = await prisma.outreachActivity.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 50,
  });
  return NextResponse.json(activities);
}, ROLES.DIRECTOR);

export { GET };