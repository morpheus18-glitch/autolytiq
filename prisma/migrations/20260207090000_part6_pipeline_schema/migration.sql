-- CreateEnum
CREATE TYPE "WorkflowTaskType" AS ENUM ('DETAIL', 'PHOTOS', 'RECON', 'TRANSPORT', 'PRICING', 'LISTING', 'QA', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkflowTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "TransportOrderStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Notification"
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "payload" JSONB;

-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "slaHours" INTEGER,
    "wipLimit" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleWorkflow" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "currentStageId" TEXT,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VehicleWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTransition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "byUserId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "StageTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stageId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "WorkflowTaskType" NOT NULL DEFAULT 'OTHER',
    "status" "WorkflowTaskStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMPTZ(6),
    "assigneeId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "checklist" JSONB,
    "costCents" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stageId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "vendor" TEXT,
    "pickupAddress" TEXT,
    "dropoffAddress" TEXT,
    "scheduledAt" TIMESTAMPTZ(6),
    "status" "TransportOrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "costCents" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TransportOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineAggregate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "stageKey" TEXT NOT NULL,
    "bucketStart" TIMESTAMPTZ(6) NOT NULL,
    "avgTimeInStageMinutes" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "slaHitRate" DECIMAL(5,2),
    "wipMax" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PipelineAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_tenantId_name_key" ON "WorkflowDefinition"("tenantId", "name");

-- CreateIndex
CREATE INDEX "WorkflowDefinition_tenantId_idx" ON "WorkflowDefinition"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_tenantId_definitionId_key_key" ON "WorkflowStage"("tenantId", "definitionId", "key");

-- CreateIndex
CREATE INDEX "WorkflowStage_tenantId_definitionId_position_idx" ON "WorkflowStage"("tenantId", "definitionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleWorkflow_tenantId_vehicleId_key" ON "VehicleWorkflow"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "VehicleWorkflow_tenantId_definitionId_idx" ON "VehicleWorkflow"("tenantId", "definitionId");

-- CreateIndex
CREATE INDEX "VehicleWorkflow_tenantId_currentStageId_idx" ON "VehicleWorkflow"("tenantId", "currentStageId");

-- CreateIndex
CREATE INDEX "StageTransition_tenantId_workflowId_at_idx" ON "StageTransition"("tenantId", "workflowId", "at");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_vehicleId_idx" ON "WorkflowTask"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_workflowId_idx" ON "WorkflowTask"("tenantId", "workflowId");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_status_idx" ON "WorkflowTask"("tenantId", "status");

-- CreateIndex
CREATE INDEX "WorkflowTask_tenantId_type_idx" ON "WorkflowTask"("tenantId", "type");

-- CreateIndex
CREATE INDEX "TransportOrder_tenantId_vehicleId_idx" ON "TransportOrder"("tenantId", "vehicleId");

-- CreateIndex
CREATE INDEX "TransportOrder_tenantId_workflowId_idx" ON "TransportOrder"("tenantId", "workflowId");

-- CreateIndex
CREATE INDEX "TransportOrder_tenantId_status_idx" ON "TransportOrder"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineAggregate_tenantId_definitionId_stageKey_bucketStart_key" ON "PipelineAggregate"("tenantId", "definitionId", "stageKey", "bucketStart");

-- CreateIndex
CREATE INDEX "PipelineAggregate_tenantId_bucketStart_idx" ON "PipelineAggregate"("tenantId", "bucketStart");

-- AddForeignKey
ALTER TABLE "WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleWorkflow" ADD CONSTRAINT "VehicleWorkflow_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "VehicleWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTransition" ADD CONSTRAINT "StageTransition_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "VehicleWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "VehicleWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineAggregate" ADD CONSTRAINT "PipelineAggregate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineAggregate" ADD CONSTRAINT "PipelineAggregate_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
