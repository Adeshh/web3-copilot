-- CreateTable
CREATE TABLE "AgentState" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "checkpoint" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentState_threadId_idx" ON "AgentState"("threadId");
