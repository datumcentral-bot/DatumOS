-- CreateTable
CREATE TABLE "OpsCase" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENQUIRY',
    "synthetic" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "proposalId" TEXT,
    "projectId" TEXT,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsReceipt" (
    "key" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsReceipt_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "OpsDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "family" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "extractionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "extractedText" TEXT,
    "anchors" JSONB,
    "limitations" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsRequirement" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'FACT',
    "status" TEXT NOT NULL DEFAULT 'UNREVIEWED',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "OpsRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsProposalRevision" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "lines" JSONB NOT NULL,
    "assumptions" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "contentHash" TEXT NOT NULL,
    "preparedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsProposalRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsClientDecision" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "evidenceDocumentId" TEXT NOT NULL,
    "acceptedBy" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsClientDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTaskReview" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsTaskReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsDelivery" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "evidenceDocumentId" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpsDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsRun" (
    "id" TEXT NOT NULL,
    "caseId" TEXT,
    "mode" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "output" JSONB,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTraining" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "completedAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "OpsTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsPayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "recordedBy" TEXT NOT NULL,

    CONSTRAINT "OpsPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpsCase_reference_key" ON "OpsCase"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "OpsCase_leadId_key" ON "OpsCase"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsCase_quoteRequestId_key" ON "OpsCase"("quoteRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsCase_proposalId_key" ON "OpsCase"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsCase_projectId_key" ON "OpsCase"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsCase_invoiceId_key" ON "OpsCase"("invoiceId");

-- CreateIndex
CREATE INDEX "OpsCase_ownerId_archived_idx" ON "OpsCase"("ownerId", "archived");

-- CreateIndex
CREATE UNIQUE INDEX "OpsDocument_storageKey_key" ON "OpsDocument"("storageKey");

-- CreateIndex
CREATE INDEX "OpsDocument_caseId_sha256_idx" ON "OpsDocument"("caseId", "sha256");

-- CreateIndex
CREATE UNIQUE INDEX "OpsDocument_caseId_family_revision_key" ON "OpsDocument"("caseId", "family", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "OpsRequirement_documentId_anchor_key" ON "OpsRequirement"("documentId", "anchor");

-- CreateIndex
CREATE UNIQUE INDEX "OpsProposalRevision_caseId_revision_key" ON "OpsProposalRevision"("caseId", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "OpsClientDecision_revisionId_key" ON "OpsClientDecision"("revisionId");

-- CreateIndex
CREATE INDEX "OpsTaskReview_taskId_createdAt_idx" ON "OpsTaskReview"("taskId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OpsTraining_userId_sopId_key" ON "OpsTraining"("userId", "sopId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsPayment_invoiceId_reference_key" ON "OpsPayment"("invoiceId", "reference");

-- AddForeignKey
ALTER TABLE "OpsCase" ADD CONSTRAINT "OpsCase_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsCase" ADD CONSTRAINT "OpsCase_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsCase" ADD CONSTRAINT "OpsCase_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsCase" ADD CONSTRAINT "OpsCase_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsCase" ADD CONSTRAINT "OpsCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsCase" ADD CONSTRAINT "OpsCase_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDocument" ADD CONSTRAINT "OpsDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OpsCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsRequirement" ADD CONSTRAINT "OpsRequirement_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OpsCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsRequirement" ADD CONSTRAINT "OpsRequirement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "OpsDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsProposalRevision" ADD CONSTRAINT "OpsProposalRevision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OpsCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsClientDecision" ADD CONSTRAINT "OpsClientDecision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OpsCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsClientDecision" ADD CONSTRAINT "OpsClientDecision_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "OpsProposalRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsClientDecision" ADD CONSTRAINT "OpsClientDecision_evidenceDocumentId_fkey" FOREIGN KEY ("evidenceDocumentId") REFERENCES "OpsDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTaskReview" ADD CONSTRAINT "OpsTaskReview_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDelivery" ADD CONSTRAINT "OpsDelivery_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OpsCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsDelivery" ADD CONSTRAINT "OpsDelivery_evidenceDocumentId_fkey" FOREIGN KEY ("evidenceDocumentId") REFERENCES "OpsDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsRun" ADD CONSTRAINT "OpsRun_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OpsCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTraining" ADD CONSTRAINT "OpsTraining_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTraining" ADD CONSTRAINT "OpsTraining_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "Sop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsPayment" ADD CONSTRAINT "OpsPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
