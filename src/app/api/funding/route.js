import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GET = withAuth(async () => {
  // B1.19: Funding from invoices + expenses (real financial data)
  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({ include: { project: true, client: true }, orderBy: { issueDate: "desc" } }),
    prisma.expense.findMany({ include: { project: true }, orderBy: { date: "desc" } }),
  ]);
  return NextResponse.json({ invoices, expenses });
}, ROLES.DIRECTOR);

export { GET };