import { Router } from 'express';
import {
  checkInAppointment,
  completeAppointment,
  createAppointment,
  deleteAppointment,
  getAppointment,
  listAppointments,
  markAppointmentNoShow,
  updateAppointment,
} from '../controllers/appointment.controller.js';

export const appointmentRouter = Router();

appointmentRouter.get('/', listAppointments);
appointmentRouter.post('/', createAppointment);
appointmentRouter.get('/:id', getAppointment);
appointmentRouter.put('/:id', updateAppointment);
appointmentRouter.delete('/:id', deleteAppointment);
appointmentRouter.post('/:id/check-in', checkInAppointment);
appointmentRouter.post('/:id/complete', completeAppointment);
appointmentRouter.post('/:id/no-show', markAppointmentNoShow);
