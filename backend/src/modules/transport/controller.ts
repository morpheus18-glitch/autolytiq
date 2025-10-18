import type { Request, Response } from 'express';
import { created, ok } from '../../lib/response.js';
import { Unprocessable } from '../../lib/errors.js';
import { transportOrderCreateSchema, transportOrderUpdateSchema } from './dto.js';
import { createTransportOrder, updateTransportOrder } from './service.js';

export async function create(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = transportOrderCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid transport order payload', parsed.error.flatten());
  }
  const order = await createTransportOrder(tenantId, parsed.data);
  return created(res, order);
}

export async function update(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const { id } = req.params;
  const parsed = transportOrderUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid transport order update payload', parsed.error.flatten());
  }
  const order = await updateTransportOrder(tenantId, id, parsed.data);
  return ok(res, order);
}
