import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, ROLES } from "@/lib/auth";
import { HURL_PROPOSAL } from "@/lib/hurl-proposal";

export const dynamic = "force-dynamic";

const GET = withAuth(async () => {
  const HURL_PROJECT_ID = "4d02d2398e5988364b8f5b25c0be2fb3";
  const HURL_CLIENT_ID = "50163065c6957a22f737ded0746ae65c";

  let proposal = await prisma.proposal.findFirst({
    where: { projectId: HURL_PROJECT_ID, proposalNo: HURL_PROPOSAL.quotationNumber },
    include: { quotations: true, project: true, client: true },
  });

  if (!proposal) {
    proposal = await prisma.proposal.create({
      data: {
        proposalNo: HURL_PROPOSAL.quotationNumber,
        title: HURL_PROPOSAL.title,
        scope: `Infrastructure BIM — ${HURL_PROPOSAL.projectCoverage}`,
        value: HURL_PROPOSAL.totalFee,
        currency: HURL_PROPOSAL.currency,
        status: "DRAFT",
        revision: HURL_PROPOSAL.revision,
        validUntil: new Date(Date.now() + 30 * 86400000),
        notes: HURL_PROPOSAL.totalFeeWords,
        clientId: HURL_CLIENT_ID,
        projectId: HURL_PROJECT_ID,
      },
      include: { quotations: true, project: true, client: true },
    });
  }

  return NextResponse.json({ proposal, content: HURL_PROPOSAL });
}, ROLES.DIRECTOR, ROLES.MEMBER);

export { GET };