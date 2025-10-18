import { z } from 'zod';

export const moveStageSchema = z.object({
  toStageKey: z.string().min(2),
  note: z.string().max(2000).optional(),
});

export type MoveStageInput = z.infer<typeof moveStageSchema>;

export const boardQuerySchema = z.object({
  stageKeys: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0)
        : [],
    ),
  limit: z.coerce.number().int().min(1).max(100).default(40),
  cursor: z.string().optional(),
  assignee: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((entry) => entry.trim().toLowerCase())
            .filter((entry) => entry.length > 0)
        : [],
    ),
});

export type BoardQuery = z.infer<typeof boardQuerySchema>;

export interface PipelineBoardVehicleCard {
  workflowId: string;
  vehicleId: string;
  vin: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  stageKey: string;
  timeInStageMinutes: number;
  slaHours?: number | null;
  slaStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  assignees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  openTasks: number;
  blockedTasks: number;
  tags: string[];
}

export interface PipelineBoardStageColumn {
  id: string;
  key: string;
  name: string;
  position: number;
  slaHours?: number | null;
  wipLimit?: number | null;
  vehicles: PipelineBoardVehicleCard[];
}

export interface PipelineBoardResponse {
  definitionId: string;
  stages: PipelineBoardStageColumn[];
  nextCursor?: string;
}

export interface PipelineTimelineEvent {
  id: string;
  type: 'transition' | 'task' | 'transport';
  occurredAt: string;
  summary: string;
  details?: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  metadata?: Record<string, unknown>;
}

export interface PipelineTimelineResponse {
  vehicleId: string;
  workflowId: string;
  currentStageKey: string;
  events: PipelineTimelineEvent[];
}
