/**
 * Workflows Seeder
 * Creates workflow definitions and stages for vehicle pipeline
 */

import { PrismaClient } from '@prisma/client';
import { DEFAULT_WORKFLOW_STAGES } from '../data/workflowStages';

/**
 * Vehicle workflow stages (additional to CRM stages)
 * These are for vehicle inventory management workflow
 */
const VEHICLE_WORKFLOW_STAGES = [
  { key: 'ACQUISITION', name: 'Acquisition' },
  { key: 'INTAKE', name: 'Intake' },
  { key: 'INSPECTION', name: 'Inspection' },
  { key: 'RECON', name: 'Reconditioning', slaHours: 72 },
  { key: 'DETAIL', name: 'Detail', slaHours: 24 },
  { key: 'PHOTOS', name: 'Photos', slaHours: 24 },
  { key: 'TRANSPORT', name: 'Transport', slaHours: 72 },
  { key: 'PRICING_SIGNOFF', name: 'Pricing Signoff' },
  { key: 'LISTING', name: 'Listing' },
  { key: 'FRONTLINE_READY', name: 'Frontline Ready' },
  { key: 'SOLD', name: 'Sold' },
] as const;

/**
 * Seed workflows
 * Creates workflow definitions with stages
 */
export async function seedWorkflows(
  prisma: PrismaClient,
  tenantId: string
) {
  console.log('\n🔄 Seeding workflows...');

  // Create vehicle pipeline workflow
  const workflowDefinition = await prisma.workflowDefinition.create({
    data: {
      tenantId,
      name: 'Default Vehicle Pipeline',
      stages: {
        create: VEHICLE_WORKFLOW_STAGES.map((stage, index) => ({
          tenantId,
          key: stage.key,
          name: stage.name,
          position: index + 1,
          slaHours: stage.slaHours ?? null,
          wipLimit: stage.wipLimit ?? null,
        })),
      },
    },
    include: { stages: true },
  });

  console.log(`  ✓ Created workflow: ${workflowDefinition.name} with ${workflowDefinition.stages.length} stages`);

  // Create stage map for easy lookup
  const pipelineStageMap = new Map(
    workflowDefinition.stages.map((stage) => [stage.key, stage])
  );

  // Get acquisition stage (commonly used as default)
  const acquisitionStage = pipelineStageMap.get('ACQUISITION');
  if (!acquisitionStage) {
    throw new Error('Default pipeline is missing ACQUISITION stage');
  }

  const pipelineStageKeys = VEHICLE_WORKFLOW_STAGES.map((stage) => stage.key);

  return {
    workflowDefinition,
    pipelineStageMap,
    acquisitionStage,
    pipelineStageKeys,
  };
}
