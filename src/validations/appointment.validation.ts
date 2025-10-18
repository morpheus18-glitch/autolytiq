import { AppointmentStatus, AppointmentType } from '@prisma/client';
import { z } from 'zod';

export const appointmentListQuerySchema = z
  .object({
    status: z.nativeEnum(AppointmentStatus).optional(),
    type: z.nativeEnum(AppointmentType).optional(),
    assignedToId: z.string().min(1).optional(),
    leadId: z.string().min(1).optional(),
    customerId: z.string().min(1).optional(),
    vehicleId: z.string().min(1).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .refine((data) => {
    if (data.from && data.to) {
      return data.to >= data.from;
    }
    return true;
  }, { message: 'to must be greater than or equal to from', path: ['to'] });

export const appointmentCreateSchema = z
  .object({
    title: z.string().min(1),
    notes: z.string().optional(),
    type: z.nativeEnum(AppointmentType),
    status: z.nativeEnum(AppointmentStatus).optional(),
    location: z.string().optional(),
    timeZone: z.string().min(1).optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    leadId: z.string().min(1).optional(),
    customerId: z.string().min(1).optional(),
    assignedToId: z.string().min(1).optional(),
    vehicleId: z.string().min(1).optional(),
  })
  .refine((data) => {
    if (data.endAt) {
      return data.endAt > data.startAt;
    }
    return true;
  }, { message: 'endAt must be after startAt', path: ['endAt'] });

export const appointmentUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    notes: z.string().optional().nullable(),
    type: z.nativeEnum(AppointmentType).optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    location: z.string().optional().nullable(),
    timeZone: z.string().min(1).optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional().nullable(),
    leadId: z.string().min(1).optional().nullable(),
    customerId: z.string().min(1).optional().nullable(),
    assignedToId: z.string().min(1).optional().nullable(),
    vehicleId: z.string().min(1).optional().nullable(),
  })
  .refine((data) => {
    if (data.startAt && data.endAt) {
      return data.endAt > data.startAt;
    }
    return true;
  }, { message: 'endAt must be after startAt', path: ['endAt'] });

export const appointmentCheckInSchema = z.object({
  timestamp: z.coerce.date().optional(),
});

export const appointmentCompleteSchema = z.object({
  outcome: z.string().max(2000).optional(),
  createDeal: z.boolean().optional(),
});

export const appointmentNoShowSchema = z.object({
  note: z.string().max(2000).optional(),
});

export type AppointmentListQuery = z.infer<typeof appointmentListQuerySchema>;
export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
export type AppointmentCheckInInput = z.infer<typeof appointmentCheckInSchema>;
export type AppointmentCompleteInput = z.infer<typeof appointmentCompleteSchema>;
export type AppointmentNoShowInput = z.infer<typeof appointmentNoShowSchema>;
