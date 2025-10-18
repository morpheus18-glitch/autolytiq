import type { Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../../lib/response.js';
import { Unprocessable } from '../../lib/errors.js';
import { boardQuerySchema, moveStageSchema } from './dto.js';
import {
  getPipelineBoard,
  getVehicleTimeline,
  moveVehicleStage,
  startVehicleWorkflow,
} from './service.js';

const vehicleIdParamSchema = z.object({ vehicleId: z.string().min(1) });

export async function start(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const parsedParams = vehicleIdParamSchema.parse(req.params);
  const workflow = await startVehicleWorkflow(tenantId, parsedParams.vehicleId, userId);
  return ok(res, workflow);
}

export async function move(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const parsedParams = vehicleIdParamSchema.parse(req.params);
  const parsedBody = moveStageSchema.safeParse(req.body);
  if (!parsedBody.success) {
    throw Unprocessable('Invalid stage move payload', parsedBody.error.flatten());
  }
  const workflow = await moveVehicleStage(tenantId, parsedParams.vehicleId, userId, parsedBody.data);
  return ok(res, workflow);
}

export async function board(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = boardQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw Unprocessable('Invalid board filters', parsed.error.flatten());
  }
  const boardData = await getPipelineBoard(tenantId, parsed.data);
  return ok(res, boardData);
}

export async function timeline(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsedParams = vehicleIdParamSchema.parse(req.params);
  const timelineData = await getVehicleTimeline(tenantId, parsedParams.vehicleId);
  return ok(res, timelineData);
}
