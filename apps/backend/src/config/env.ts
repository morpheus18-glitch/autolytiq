import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required').default(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApGfG60JgB+vHNiTNGOBy
g4S1hoPazTA/gkGEXUXMaLLq5yRvCNrI6VOGGAaHo9dZYkTfGZNVVRFl1kYyqS/f
wLw1sYUNsGrD+VUKPTySGTsNMndvrYVF/1DdbC+aD7agEXkNKOxPQ0PqSxkbZVqM
l8I4JVXu2fLG3gNsYch0JJYRqpMfrQa6RlmKCNt2uQ6Xo8XzYx+lNEzbG8VS9/6g
xF2Y2v3hF8oD7YVOlJawVSjGInxjeRGna43EIBgzHuLlHotE5T7V6czS4QhIwTZY
h9+VFeReyqYhB1tZEDQhTWZ+9VtxxvpG6vE11wV8L19/9ey7NwxKXlzVEk+iXdc5
FQIDAQAB
-----END PUBLIC KEY-----`),
    JWT_ISSUER: z.string().min(1, 'JWT_ISSUER is required').default('autolytiq-dev'),
    JWT_AUDIENCE: z.string().min(1, 'JWT_AUDIENCE is required').default('autolytiq-dev'),
    SENDGRID_API_KEY: z.string().optional(),
    SENDGRID_FROM: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),
    TWILIO_CALLER_ID: z.string().optional(),
    SOCKET_IO_CORS_ORIGIN: z.string().min(1, 'SOCKET_IO_CORS_ORIGIN is required').default('*'),
    APP_URL: z.string().min(1, 'APP_URL is required').default('http://localhost:3000'),
    API_URL: z.string().min(1, 'API_URL is required').default('http://localhost:5000'),
    ML_SERVICE_URL: z
      .string()
      .url('ML_SERVICE_URL must be a valid URL')
      .default('http://localhost:8000'),
    ML_SERVICE_TOKEN: z.string().min(1, 'ML_SERVICE_TOKEN is required').default('dev-ml-token'),
    REDIS_URL: z.string().optional(),
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
