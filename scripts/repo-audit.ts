import { promises as fs } from 'node:fs';
import path from 'node:path';
import { globby } from 'globby';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'var', 'reports');

const EXPECTED_PORTS: Record<string, number> = {
  frontend: 3000,
  backend: 5000,
  ml: 8000,
};

const ENV_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'SENDGRID_WEBHOOK_SIGNING_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_MESSAGING_SERVICE_SID',
  'PEXELS_API_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET',
  'S3_REGION',
  'S3_ENDPOINT',
  'CLICKHOUSE_HOST',
  'CLICKHOUSE_PORT',
  'CLICKHOUSE_USER',
  'CLICKHOUSE_PASSWORD',
];

function toPosix(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

async function readFileSafe(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function detectPorts(label: string, patterns: string[], port: number) {
  const files = await globby(patterns, { cwd: ROOT, gitignore: true, dot: false });
  const hits: string[] = [];

  for (const relativePath of files) {
    const absolutePath = path.join(ROOT, relativePath);
    const content = await readFileSafe(absolutePath);
    if (content.includes(port.toString())) {
      hits.push(toPosix(relativePath));
    }
  }

  return {
    expectedPort: port,
    observedIn: hits,
    filesScanned: files.map(toPosix),
    verdict: hits.length > 0,
  };
}

async function detectHealthEndpoints(patterns: string[]) {
  const files = await globby(patterns, { cwd: ROOT, gitignore: true });
  const health: string[] = [];
  const metrics: string[] = [];

  for (const relativePath of files) {
    const absolutePath = path.join(ROOT, relativePath);
    const content = await readFileSafe(absolutePath);
    if (/\/health\b/.test(content)) {
      health.push(toPosix(relativePath));
    }
    if (/\/metrics\b/.test(content)) {
      metrics.push(toPosix(relativePath));
    }
  }

  return { health, metrics };
}

async function detectEnvVarUsage() {
  const files = await globby(
    [
      'backend/src/**/*.{ts,js}',
      'client/src/**/*.{ts,tsx,js,jsx}',
      'ml_service/**/*.{py}',
      'ml_service/**/*.{py}',
      '*.config.*',
    ],
    { cwd: ROOT, gitignore: true },
  );

  const cache = new Map<string, string>();
  const usages: Record<string, string[]> = {};

  for (const relativePath of files) {
    const absolutePath = path.join(ROOT, relativePath);
    const content = await readFileSafe(absolutePath);
    cache.set(relativePath, content);
  }

  for (const variable of ENV_VARS) {
    const hits: string[] = [];
    for (const [relativePath, content] of cache.entries()) {
      if (content.includes(variable)) {
        hits.push(toPosix(relativePath));
      }
    }
    usages[variable] = hits.sort();
  }

  return usages;
}

async function detectServiceFiles() {
  const frontend = await globby(['client/vite.config.*', 'vite.config.*'], { cwd: ROOT, gitignore: true });
  const backend = await globby(['backend/src/server.ts', 'backend/src/app.ts', 'server/src/server.ts'], {
    cwd: ROOT,
    gitignore: true,
  });
  const ml = await globby(['ml_service/app/main.py', 'ml_service/main.py', 'ml_service/src/main.py'], {
    cwd: ROOT,
    gitignore: true,
  });
  const celery = await globby(['ml_service/workers/**/*', 'ml_service/celery*.py'], { cwd: ROOT, gitignore: true });

  return {
    frontend: frontend.map(toPosix),
    backend: backend.map(toPosix),
    ml: ml.map(toPosix),
    celery: celery.map(toPosix),
  };
}

async function writeJsonReport(fileName: string, data: unknown) {
  const target = path.join(REPORT_DIR, fileName);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function writePlan(remediation: string[]) {
  const lines = ['# Infrastructure Remediation Plan', '', ...remediation.map((item, index) => `${index + 1}. ${item}`)];
  const target = path.join(REPORT_DIR, 'infra-plan.md');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, lines.join('\n') + '\n', 'utf8');
}

async function main() {
  const services = await detectServiceFiles();

  const portFacts = {
    frontend: await detectPorts('frontend', ['client/src/**/*.{ts,tsx,js,jsx}', 'vite.config.*'], EXPECTED_PORTS.frontend),
    backend: await detectPorts('backend', ['backend/src/**/*.{ts,js}', 'server/src/**/*.{ts,js}'], EXPECTED_PORTS.backend),
    ml: await detectPorts('ml', ['ml_service/**/*.py'], EXPECTED_PORTS.ml),
  } as const;

  const endpoints = await detectHealthEndpoints([
    'backend/src/**/*.{ts,js}',
    'ml_service/**/*.py',
    'ml_service/**/*.py',
  ]);

  const envUsages = await detectEnvVarUsage();

  const facts = {
    generatedAt: new Date().toISOString(),
    services,
    ports: portFacts,
    endpoints,
    envUsages,
  };

  await writeJsonReport('infra-audit.json', facts);

  const remediation: string[] = [];

  remediation.push('Enforce a shared environment contract across backend and ML services with strict validation.');
  remediation.push('Introduce feature flags to gate Docker/K8s self-hosted assets while keeping Replit defaults.');
  remediation.push('Ensure Redis-backed caching and Celery worker topology share a unified REDIS_URL configuration.');
  remediation.push('Add health and metrics endpoints for backend and ML services aligned with Prometheus conventions.');
  remediation.push('Harden secret management with gitleaks scans and pre-commit enforcement.');
  remediation.push('Document Replit development workflow, secrets management, and cloud provider setup.');

  await writePlan(remediation);
}

main().catch((error) => {
  console.error('[repo-audit] Failed to generate infrastructure audit:', error);
  process.exit(1);
});
