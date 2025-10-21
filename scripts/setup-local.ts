import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const envPath = path.join(repoRoot, '.env');
const envExamplePath = path.join(repoRoot, '.env.example');

function ensureEnvFile(): void {
  if (existsSync(envPath)) {
    return;
  }

  if (existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env from .env.example. Update credentials before running services.');
    return;
  }

  throw new Error('No .env file found and .env.example is missing. Create one before continuing.');
}

type Step = {
  title: string;
  command: string;
  args: string[];
  envValidation?: () => void;
};

function runStep(step: Step): void {
  console.log(`\n➡️  ${step.title}`);
  const result = spawnSync(step.command, step.args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${step.command} ${step.args.join(' ')}`);
  }
}

function validateRequiredEnv(): void {
  const required = ['DATABASE_URL', 'SESSION_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('    Update your .env file before starting the application.');
  }
}

function main(): void {
  ensureEnvFile();
  dotenv.config({ path: envPath });
  validateRequiredEnv();

  const steps: Step[] = [
    {
      title: 'Installing Node dependencies',
      command: 'pnpm',
      args: ['install'],
    },
    {
      title: 'Generating Prisma client',
      command: 'pnpm',
      args: ['exec', 'prisma', 'generate'],
    },
    {
      title: 'Applying database migrations',
      command: 'pnpm',
      args: ['exec', 'prisma', 'migrate', 'deploy'],
    },
    {
      title: 'Seeding baseline data',
      command: 'pnpm',
      args: ['db:seed'],
    },
  ];

  for (const step of steps) {
    runStep(step);
  }

  console.log('\n✅ Local environment is ready. Start the API with `pnpm dev` and the frontend with `pnpm dev:frontend`.');
}

try {
  main();
} catch (error) {
  console.error('\n❌ Setup failed.');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
