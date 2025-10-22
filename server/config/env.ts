import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine(
        (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
        'DATABASE_URL must be a postgres connection string',
      ),
    DIRECT_URL: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value || value.startsWith('postgres://') || value.startsWith('postgresql://'),
        'DIRECT_URL must be a postgres connection string',
      ),
    SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters long'),
  })
  .transform((values) => ({
    ...values,
    DIRECT_URL: values.DIRECT_URL ?? undefined,
  }));

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
});

export type Env = typeof env;
