import 'dotenv/config';
import { cleanEnv, num, str, url } from 'envalid';
import { DEPLOY_MODE, FEATURE_CLICKHOUSE } from './flags.js';

const ENV = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  DEPLOY_MODE: str({ choices: ['replit', 'self_hosted'], default: 'replit' }),
  PORT: num({ default: 80 }),
  DATABASE_URL: str(),
  DIRECT_URL: str({ default: undefined }),
  REDIS_URL: str(),
  JWT_SECRET: str(),
  JWT_PUBLIC_KEY: str({ default: undefined }),
  JWT_PRIVATE_KEY: str({ default: undefined }),
  JWT_ISSUER: str({ default: 'autolytiq' }),
  JWT_AUDIENCE: str({ default: 'autolytiq-clients' }),
  SENDGRID_API_KEY: str(),
  SENDGRID_FROM_EMAIL: str(),
  SENDGRID_WEBHOOK_SIGNING_KEY: str(),
  SMTP_HOST: str({ default: 'smtp.sendgrid.net' }),
  SMTP_PORT: num({ default: 587 }),
  SMTP_USER: str({ default: '' }),
  SMTP_PASS: str({ default: '' }),
  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_MESSAGING_SERVICE_SID: str(),
  TWILIO_CALLER_ID: str({ default: '' }),
  PEXELS_API_KEY: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_REGION: str({ default: '' }),
  S3_BUCKET: str(),
  S3_REGION: str({ default: '' }),
  S3_ENDPOINT: str({ default: '' }),
  S3_CLOUDFRONT_URL: str({ default: '' }),
  APP_URL: url({ default: 'http://localhost:3000' }),
  API_URL: url({ default: 'http://localhost:5000/api' }),
  ML_SERVICE_URL: url({ default: 'http://localhost:8000' }),
  SOCKET_IO_CORS_ORIGIN: str({ default: 'http://localhost:5173' }),
  SESSION_SECRET: str(),
  CLICKHOUSE_HOST: str({ default: '' }),
  CLICKHOUSE_PORT: num({ default: 8123 }),
  CLICKHOUSE_USER: str({ default: '' }),
  CLICKHOUSE_PASSWORD: str({ default: '' }),
});

const missingForSelfHosted: string[] = [];

if (ENV.DEPLOY_MODE === 'self_hosted') {
  for (const key of [
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'SENDGRID_WEBHOOK_SIGNING_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_MESSAGING_SERVICE_SID',
    'PEXELS_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET',
  ] as const) {
    if (!ENV[key]) {
      missingForSelfHosted.push(key);
    }
  }
}

const clickhouseConfigured = FEATURE_CLICKHOUSE || ENV.CLICKHOUSE_HOST.length > 0;
if (clickhouseConfigured) {
  for (const key of ['CLICKHOUSE_PORT', 'CLICKHOUSE_USER'] as const) {
    if (!ENV[key]) {
      missingForSelfHosted.push(key);
    }
  }
}

if (missingForSelfHosted.length > 0) {
  throw new Error(
    `Missing required environment variables for ${DEPLOY_MODE} deploy mode: ${missingForSelfHosted.join(', ')}`,
  );
}

export type Environment = Readonly<typeof ENV>;
export { ENV };
export const env = ENV;
