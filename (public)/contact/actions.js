"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Public contact form -> creates a CRM Lead (To Contact) + activity log entry.
export async function submitContact(formData) {
  const company = (formData.get("company") || "").toString().trim();
  const contactName = (formData.get("name") || "").toString().trim();
  const contactEmail = (formData.get("email") || "").toString().trim();
  const country = (formData.get("country") || "").toString().trim();
  const serviceInterest = (formData.get("service") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  if (!contactName || !contactEmail) {
    return { ok: false, message: "Name and email are required." };
  }

  await prisma.lead.create({
    data: {
      company: company || `${contactName} (inbound)`,
      contactName,
      contactEmail,
      country: country || null,
      source: "Inbound",
      serviceInterest: serviceInterest || "General enquiry",
      estValue: 0,
      stage: "TO_CONTACT",
      probability: 10,
      ownerName: "Bilal Ahmed",
      notes: message || "Submitted via public contact form.",
    },
  });

  await prisma.activityLog.create({
    data: {
      actor: contactName,
      action: "CREATED",
      entity: "Lead",
      summary: `new inbound enquiry from ${company || contactName} (${serviceInterest || "general"})`,
      portal: "director",
    },
  });

  revalidatePath("/director/crm");
  revalidatePath("/director");
  return { ok: true, message: "Thanks — your enquiry has reached our team. We'll respond within one business day." };
}
