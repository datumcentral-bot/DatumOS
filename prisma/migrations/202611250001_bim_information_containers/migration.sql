-- CreateTable
CREATE TABLE "BimInformationContainer" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'WIP',
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BimInformationContainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BimInformationContainer_containerId_key" ON "BimInformationContainer"("containerId");

-- CreateIndex
CREATE INDEX "BimInformationContainer_projectId_createdAt_idx" ON "BimInformationContainer"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "BimInformationContainer" ADD CONSTRAINT "BimInformationContainer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
