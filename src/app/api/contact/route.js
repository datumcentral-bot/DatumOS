import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// QuoteForm -> POST /api/contact
// 1. Saves a QuoteRequest record (full payload)
// 2. Creates a CRM Lead (TO_CONTACT stage)
// 3. Logs to ActivityLog
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, service, projectType, message } = body;

    if (!name || !email) {
      return NextResponse.json({ ok: false, message: "Name and email are required." }, { status: 400 });
    }

    // Create CRM Lead first so we can link it
    const lead = await prisma.lead.create({
      data: {
        company: company || `${name} (inbound)`,
        contactName: name,
        contactEmail: email,
        country: null,
        source: "Inbound",
        serviceInterest: service || "General enquiry",
        estValue: 0,
        stage: "TO_CONTACT",
        probability: 10,
        ownerName: "Bilal Ahmed",
        notes: [
          message,
          projectType ? `Project type: ${projectType}` : null,
          phone ? `Phone: ${phone}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    // Save full quote request payload
    await prisma.quoteRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        service: service || null,
        projectType: projectType || null,
        message: message || null,
        leadId: lead.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        actor: name,
        action: "CREATED",
        entity: "Lead",
        entityId: lead.id,
        summary: `Quote request from ${company || name} for ${service || "general enquiry"}`,
        portal: "public",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you. DATUM BIM ENGINEERING will review your project details and respond within one business day.",
    });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false, message: "Something went wrong. Please email us directly." }, { status: 500 });
  }
}
