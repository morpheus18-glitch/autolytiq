import { WorkflowTaskStatus, WorkflowTaskType } from '@prisma/client';
import { z } from 'zod';

export const taskCreateSchema = z.object({
  workflowId: z.string().min(1),
  vehicleId: z.string().min(1),
  stageId: z.string().optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(4000).optional(),
  type: z.nativeEnum(WorkflowTaskType).default(WorkflowTaskType.OTHER),
  status: z.nativeEnum(WorkflowTaskStatus).default(WorkflowTaskStatus.OPEN),
  dueAt: z.preprocess((value) => (value ? new Date(String(value)) : undefined), z.date().optional()),
  assigneeId: z.string().optional(),
  tags: z.array(z.string().max(50)).optional().default([]),
  mentions: z.array(z.string().max(128)).optional().default([]),
  checklist: z.record(z.any()).optional(),
  costCents: z.number().int().min(0).optional(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  status: z.nativeEnum(WorkflowTaskStatus).optional(),
  title: z.string().min(2).max(200).optional(),
});

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export const taskAssignSchema = z.object({
  assigneeId: z.string().min(1),
});

export const taskMentionSchema = z.object({
  message: z.string().min(1).max(4000),
});

export const taskQuerySchema = z.object({
  vehicleId: z.string().optional(),
  workflowId: z.string().optional(),
  stageKey: z.string().optional(),
  status: z.nativeEnum(WorkflowTaskStatus).optional(),
  type: z.nativeEnum(WorkflowTaskType).optional(),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;
