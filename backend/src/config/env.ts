import { config } from 'dotenv';
import { z } from 'zod';

config();

const keyTransformer = z
  .string()
  .min(1)
  .transform((value) => value.replace(/\\n/g, '\n'));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1).optional(),
  JWT_PUBLIC_KEY: keyTransformer,
  JWT_PRIVATE_KEY: keyTransformer,
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1),
  SENDGRID_FROM: z.string().email(),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_MESSAGING_SERVICE_SID: z.string().min(1),
  TWILIO_CALLER_ID: z.string().min(1),
  SOCKET_IO_CORS_ORIGIN: z.string().min(1),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  ML_SERVICE_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional(),
  SESSION_SECRET: z.string().min(32),
});

export type AppEnvironment = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
