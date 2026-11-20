import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { logError } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// SECURITY: the subscriber list is business contact data, not public content.
// This route stays in the middleware public allowlist so anonymous visitors can
// SUBSCRIBE, but reading the list must never be anonymous. GET previously
// returned up to 100 subscriber records to any unauthenticated caller; it now
// requires a session.

export async function POST(request) {
  try {
    const { email, source = "footer" } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    // Upsert — re-subscribing is fine
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true, source },
      create: { email, source, active: true },
    });

    await prisma.activityLog.create({
      data: {
        actor: email,
        action: "SUBSCRIBED",
        entity: "Newsletter",
        summary: `New newsletter subscriber: ${email} (source: ${source})`,
        portal: "public",
      },
    });

    return NextResponse.json({ ok: true, message: "Subscribed successfully." });
  } catch (err) {
    logError(err, request, "newsletter");
    return NextResponse.json({ ok: false, message: "Subscription failed. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ subscribers, total: subscribers.length });
}
