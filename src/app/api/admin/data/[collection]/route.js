import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// POST /api/admin/data/:collection  — bulk-replace a collection (from AdminPanel JSON editor)
// Only safe collections are allowed. DIRECTOR only.
const ALLOWED = ["leads", "newsletter", "clients", "members", "divisions"];

export async function POST(request, { params }) {
  try {
    await requireRole("DIRECTOR");
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 403 });
  }
  const { collection } = params;
  if (!ALLOWED.includes(collection)) {
    return NextResponse.json({ ok: false, message: `Collection '${collection}' is not editable via this endpoint.` }, { status: 400 });
  }

  try {
    const { items } = await request.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ ok: false, message: "items must be an array." }, { status: 400 });
    }

    // For each collection, upsert by id (create if missing, update if present)
    let count = 0;
    if (collection === "leads") {
      for (const item of items) {
        if (!item.id) continue;
        await prisma.lead.upsert({
          where: { id: item.id },
          update: {
            company: item.company,
            contactName: item.contactName,
            contactEmail: item.contactEmail,
            country: item.country,
            stage: item.stage,
            probability: item.probability,
            estValue: item.estValue,
            notes: item.notes,
          },
          create: item,
        });
        count++;
      }
    } else if (collection === "newsletter") {
      for (const item of items) {
        if (!item.email) continue;
        await prisma.newsletterSubscriber.upsert({
          where: { email: item.email },
          update: { active: item.active ?? true },
          create: { email: item.email, source: item.source || "admin", active: item.active ?? true },
        });
        count++;
      }
    } else if (collection === "clients") {
      for (const item of items) {
        if (!item.id) continue;
        await prisma.client.update({
          where: { id: item.id },
          data: {
            companyName: item.companyName,
            country: item.country,
            city: item.city,
            contactName: item.contactName,
            contactEmail: item.contactEmail,
            contactPhone: item.contactPhone,
          },
        }).catch(() => null);
        count++;
      }
    } else if (collection === "members") {
      for (const item of items) {
        if (!item.id) continue;
        await prisma.user.update({
          where: { id: item.id },
          data: {
            name: item.name,
            email: item.email,
            role: item.role,
            title: item.title,
            division: item.division,
            active: item.active ?? true,
          },
        }).catch(() => null);
        count++;
      }
    } else if (collection === "divisions") {
      for (const item of items) {
        if (!item.id) continue;
        await prisma.division.update({
          where: { id: item.id },
          data: {
            name: item.name,
            description: item.description,
            colorHex: item.colorHex,
          },
        }).catch(() => null);
        count++;
      }
    }

    await prisma.activityLog.create({
      data: {
        actor: "Director",
        action: "UPDATED",
        entity: collection,
        summary: `Admin panel bulk-updated ${count} records in ${collection}`,
        portal: "director",
      },
    });

    return NextResponse.json({ ok: true, updated: count });
  } catch (err) {
    console.error("[admin/data]", err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}