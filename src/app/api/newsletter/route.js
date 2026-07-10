import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    console.error("[newsletter]", err);
    return NextResponse.json({ ok: false, message: "Subscription failed. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ subscribers, total: subscribers.length });
}
