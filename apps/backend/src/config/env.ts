import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    JWT_PUBLIC_KEY: z.string().optional(),
    JWT_ISSUER: z.string().optional().default('autolytiq'),
    JWT_AUDIENCE: z.string().optional().default('autolytiq-api'),
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM: z.string().optional().default('noreply@autolytiq.com'),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),
    TWILIO_CALLER_ID: z.string().optional(),
    SOCKET_IO_CORS_ORIGIN: z.string().optional().default('*'),
    APP_URL: z.string().optional().default('http://localhost:3000'),
    API_URL: z.string().optional().default('http://localhost:5000'),
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
      .default('5000')
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
    JWT_PUBLIC_KEY: values.JWT_PUBLIC_KEY ? values.JWT_PUBLIC_KEY.replace(/\\n/g, '\n') : undefined,
  }));

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
  
  // Warn about missing optional but important variables
  if (!env.JWT_PUBLIC_KEY) {
    console.warn('⚠️  Warning: JWT_PUBLIC_KEY not set - authentication may not work');
  }
  if (!env.SENDGRID_API_KEY) {
    console.warn('⚠️  Warning: SENDGRID_API_KEY not set - email sending disabled');
  }
  if (!env.TWILIO_ACCOUNT_SID) {
    console.warn('⚠️  Warning: TWILIO_ACCOUNT_SID not set - SMS sending disabled');
  }
  if (!env.REDIS_URL && env.NODE_ENV === 'production') {
    console.warn('⚠️  Warning: REDIS_URL not set in production - session storage may be unreliable');
  }
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error instanceof z.ZodError) {
    console.error('Missing or invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error(error);
  }
  process.exit(1);
}

export { env };
