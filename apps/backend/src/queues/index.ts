import {
  cancelAppointmentJobs,
  initializeAppointmentJobs,
  scheduleAppointmentJobs,
  shutdownAppointmentJobs,
  type AppointmentJobScheduleOptions,
} from './appointment.jobs';

let initialized = false;

export function initializeQueues(): void {
  if (initialized) {
    return;
  }

  initializeAppointmentJobs();
  initialized = true;
}

export async function shutdownQueues(): Promise<void> {
  if (!initialized) {
    return;
  }

  await shutdownAppointmentJobs();
  initialized = false;
}

export { scheduleAppointmentJobs, cancelAppointmentJobs };
export type { AppointmentJobScheduleOptions };
