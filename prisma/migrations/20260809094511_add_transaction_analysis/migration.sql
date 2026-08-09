-- CreateTable
CREATE TABLE "TransactionAnalysis" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionAnalysis_pkey" PRIMARY KEY ("id")
);
