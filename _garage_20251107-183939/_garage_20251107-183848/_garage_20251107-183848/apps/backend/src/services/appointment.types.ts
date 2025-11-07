import type { Prisma } from '@prisma/client';

export const appointmentInclude = {
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      mobile: true,
    },
  },
  lead: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          mobile: true,
        },
      },
    },
  },
  assignedTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      vin: true,
      stockNumber: true,
      year: true,
      make: true,
      model: true,
      trim: true,
    },
  },
  followUpTask: {
    select: {
      id: true,
      status: true,
      subject: true,
      dueAt: true,
    },
  },
} satisfies Prisma.AppointmentInclude;

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: typeof appointmentInclude;
}>;
