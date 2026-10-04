-- CreateTable
CREATE TABLE "BulkOrderInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" TEXT,
    "productInterests" TEXT,
    "estimatedQuantity" TEXT,
    "targetDate" TIMESTAMP(3),
    "customizationNotes" TEXT,
    "notes" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "BulkOrderInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkOrderInquiry_status_idx" ON "BulkOrderInquiry"("status");

-- CreateIndex
CREATE INDEX "BulkOrderInquiry_email_idx" ON "BulkOrderInquiry"("email");

-- AddForeignKey
ALTER TABLE "BulkOrderInquiry" ADD CONSTRAINT "BulkOrderInquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
