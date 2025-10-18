import { Router, json, urlencoded } from 'express';
import * as webhookController from '../controllers/webhooks.controller.js';

export const webhookRouter = Router();

webhookRouter.post('/communications/twilio/webhook', urlencoded({ extended: true }), webhookController.handleTwilioWebhook);
webhookRouter.post('/communications/sendgrid/webhook', json({ type: '*/*' }), webhookController.handleSendGridWebhook);

export default webhookRouter;
