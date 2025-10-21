import type { Request, Response } from 'express';
import {
  appointmentCheckInSchema,
  appointmentCompleteSchema,
  appointmentCreateSchema,
  appointmentListQuerySchema,
  appointmentNoShowSchema,
  appointmentUpdateSchema,
} from '../validations/appointment.validation.js';
import * as appointmentService from '../services/appointment.service.js';
import { resolveHttpError } from '../utils/http-errors.js';

function ensureTenant(req: Request, res: Response): string | undefined {
  const tenantId = req.context?.tenantId;
  if (!tenantId) {
    res.status(403).json({ message: 'Tenant scope is required' });
    return undefined;
  }
  return tenantId;
}

const DEFAULT_ERROR_MESSAGE = 'Unexpected error';

function extractError(error: unknown): { status: number; message: string } {
  return resolveHttpError(error, 500, DEFAULT_ERROR_MESSAGE);
}

export async function listAppointments(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = appointmentListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid appointment filters', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await appointmentService.listAppointments(parsed.data);
    res.json({
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        pages: result.pages,
      },
    });
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}

export async function createAppointment(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = appointmentCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid appointment payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const appointment = await appointmentService.createAppointment(parsed.data);
    res.status(201).json({ data: appointment });
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}

export async function getAppointment(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  try {
    const appointment = await appointmentService.getAppointment(req.params.id);
    res.json({ data: appointment });
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}

export async function updateAppointment(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = appointmentUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid appointment payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}

export async function deleteAppointment(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  try {
    await appointmentService.deleteAppointment(req.params.id);
    res.status(204).send();
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}

export async function checkInAppointment(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = appointmentCheckInSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid check-in payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const appointment = await appointmentService.checkInAppointment(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}

export async function completeAppointment(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = appointmentCompleteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid completion payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const appointment = await appointmentService.completeAppointment(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}

export async function markAppointmentNoShow(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = appointmentNoShowSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid no-show payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const appointment = await appointmentService.markAppointmentNoShow(req.params.id, parsed.data);
    res.json({ data: appointment });
  } catch (error) {
    const { status, message } = extractError(error);
    res.status(status).json({ message });
  }
}
