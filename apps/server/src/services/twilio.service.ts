import twilio, { type Twilio } from 'twilio';
import { env } from '../config/env.js';

let cachedClient: Twilio | undefined;

function getClient(): Twilio {
  if (!cachedClient) {
    cachedClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return cachedClient;
}

export interface VoiceCallOptions {
  to: string;
  from?: string;
  statusCallback?: string;
  twimlUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface SmsOptions {
  to: string;
  from?: string;
  body: string;
  statusCallback?: string;
  mediaUrls?: string[];
}

export async function initiateVoiceCall(options: VoiceCallOptions) {
  const client = getClient();
  const fromNumber = options.from ?? env.TWILIO_CALLER_ID;
  const statusCallback = options.statusCallback;
  const twimlUrl = options.twimlUrl ?? `${env.API_URL.replace(/\/$/, '')}/api/communications/twilio/voice`;

  const call = await client.calls.create({
    to: options.to,
    from: fromNumber,
    url: twimlUrl,
    statusCallback,
    statusCallbackMethod: statusCallback ? 'POST' : undefined,
  });

  return call;
}

export async function sendSms(options: SmsOptions) {
  const client = getClient();
  const statusCallback = options.statusCallback;

  const message = await client.messages.create({
    to: options.to,
    from: options.from,
    body: options.body,
    messagingServiceSid: options.from ? undefined : env.TWILIO_MESSAGING_SERVICE_SID,
    statusCallback,
    mediaUrl: options.mediaUrls,
  });

  return message;
}

export function normalizePhoneNumber(value: string): string {
  return value.replace(/[^+\d]/g, '');
}
