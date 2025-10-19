import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required'),
    JWT_ISSUER: z.string().min(1, 'JWT_ISSUER is required'),
    JWT_AUDIENCE: z.string().min(1, 'JWT_AUDIENCE is required'),
    SENDGRID_API_KEY: z.string().min(1, 'SENDGRID_API_KEY is required'),
    SENDGRID_FROM: z.string().min(1, 'SENDGRID_FROM is required'),
    TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
    TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
    TWILIO_MESSAGING_SERVICE_SID: z.string().min(1, 'TWILIO_MESSAGING_SERVICE_SID is required'),
    TWILIO_CALLER_ID: z.string().min(1, 'TWILIO_CALLER_ID is required'),
    SOCKET_IO_CORS_ORIGIN: z.string().min(1, 'SOCKET_IO_CORS_ORIGIN is required'),
    APP_URL: z.string().min(1, 'APP_URL is required'),
    API_URL: z.string().min(1, 'API_URL is required'),
    ML_SERVICE_URL: z
      .string()
      .url('ML_SERVICE_URL must be a valid URL')
      .default('http://localhost:8000'),
    ML_SERVICE_TOKEN: z.string().min(1, 'ML_SERVICE_TOKEN is required').default('dev-ml-token'),
    REDIS_URL: z
      .string()
      .url('REDIS_URL must be a valid redis connection string')
      .optional(),
    AWS_REGION: z.string().min(1).optional(),
    AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
    AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    S3_CLOUDFRONT_URL: z.string().url().optional(),
    S3_ENDPOINT: z.string().url().optional(),
    CLAMAV_HOST: z.string().optional(),
    CLAMAV_PORT: z.coerce.number().int().positive().optional(),
    PORT: z
      .string()
      .default('4000')
      .transform((value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
          throw new Error('PORT must be a positive integer');
        }
        return parsed;
      }),
  })
  .transform((values) => ({
    ...values,
    JWT_PUBLIC_KEY: values.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
  }));

export const env = envSchema.parse(process.env);
