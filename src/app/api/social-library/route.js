import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GET = withAuth(async () => {
  // B1.19: Social library from campaigns + newsletter
  const [campaigns, subscribers] = await Promise.all([
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  return NextResponse.json({ campaigns, subscribers });
}, ROLES.DIRECTOR);

export { GET };