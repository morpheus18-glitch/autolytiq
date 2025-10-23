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

    // Production-specific validation
    PORT: z.coerce.number().default(5000),
    MAX_REQUEST_SIZE: z.string().default('10mb'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

    // Logging and monitoring
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),
  })
  .transform((values) => ({
    ...values,
    DIRECT_URL: values.DIRECT_URL ?? undefined,
  }))
  .refine(
    (values) => {
      // Production-specific validations
      if (values.NODE_ENV === 'production') {
        // Ensure session secret is strong in production
        if (values.SESSION_SECRET === 'local-development-session-secret-please-change') {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Production environment requires a secure SESSION_SECRET',
    },
  );

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  PORT: process.env.PORT,
  MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  LOG_LEVEL: process.env.LOG_LEVEL,
  ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING,
});

export type Env = typeof env;

// Validate production environment on startup
if (env.NODE_ENV === 'production') {
  console.log('🔍 Validating production environment...');

  const warnings: string[] = [];

  // Check for development-like values
  if (env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1')) {
    warnings.push('⚠️  DATABASE_URL appears to use localhost - ensure this is correct for production');
  }

  if (warnings.length > 0) {
    console.warn('Production environment warnings:');
    warnings.forEach((warning) => console.warn(warning));
  } else {
    console.log('✅ Production environment validated');
  }
}
