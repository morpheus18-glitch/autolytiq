import { promises as fs } from 'node:fs';
import path from 'node:path';
import { globby } from 'globby';

process.on('uncaughtException', (error) => {
  console.error('[repo-audit] Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[repo-audit] Unhandled rejection', reason);
  process.exit(1);
});

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'var', 'reports');

const EXPECTED_PORTS: Record<'frontend' | 'backend' | 'ml', number> = {
  frontend: 3000,
  backend: 5000,
  ml: 8000,
};

const ENV_CONTRACT = [
  'NODE_ENV',
  'DEPLOY_MODE',
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

type ServiceName = 'frontend' | 'backend' | 'ml';

const SERVICE_FILE_GLOBS: Record<ServiceName, string[]> = {
  frontend: ['client/src/**/*.{ts,tsx,js,jsx}', 'src/**/*.{ts,tsx,js,jsx}', 'vite.config.*'],
  backend: ['backend/src/**/*.{ts,tsx,js,jsx}'],
  ml: ['ml_service/**/*.py'],
};

const SERVICE_ENTRY_GLOBS: Record<
  'vite' | 'express' | 'fastapi' | 'celery',
  string[]
> = {
  vite: ['client/vite.config.*', 'vite.config.*'],
  express: ['backend/src/server.ts', 'backend/src/app.ts', 'server/**/*.ts', 'server/**/*.js'],
  fastapi: ['ml_service/app/main.py', 'ml_service/main.py', 'ml_service/src/main.py'],
  celery: ['ml_service/workers/**/*.{py}', 'ml_service/**/celery*.py'],
};

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

async function collectFiles(patterns: string[], options: { dot?: boolean } = {}) {
  const matches = await globby(patterns, {
    cwd: ROOT,
    gitignore: true,
    dot: options.dot ?? false,
  });
  return matches.map(toPosix);
}

async function detectPorts(label: ServiceName, patterns: string[], port: number) {
  const files = await globby(patterns, { cwd: ROOT, gitignore: true, dot: false });
  const hits: string[] = [];

  for (const relativePath of files) {
    const absolutePath = path.join(ROOT, relativePath);
    const content = await readFileSafe(absolutePath);
    const regex = new RegExp(`[^0-9]${port}(?![0-9])`);
    if (regex.test(content)) {
      hits.push(toPosix(relativePath));
    }
  }

  const verdict = hits.length > 0;

  return {
    expectedPort: port,
    observedIn: hits,
    filesScanned: files.map(toPosix),
    verdict,
    blocker: verdict ? null : `${label} port ${port} was not detected in codebase`,
  };
}

async function detectHealthEndpoints(patterns: string[]) {
  const files = await globby(patterns, { cwd: ROOT, gitignore: true });
  const health: string[] = [];
  const metrics: string[] = [];

  for (const relativePath of files) {
    const absolutePath = path.join(ROOT, relativePath);
    const content = await readFileSafe(absolutePath);
    if (/\b\/health\b/.test(content)) {
      health.push(toPosix(relativePath));
    }
    if (/\b\/metrics\b/.test(content)) {
      metrics.push(toPosix(relativePath));
    }
  }

  return { health: [...new Set(health)].sort(), metrics: [...new Set(metrics)].sort() };
}

type EnvScanResult = {
  usages: Record<string, string[]>;
  present: string[];
  missing: string[];
  extras: string[];
};

function scanEnvVariables(service: ServiceName, fileContents: Map<string, string>): EnvScanResult {
  const usages: Record<string, string[]> = {};
  const seen = new Set<string>();
  const extras = new Set<string>();

  const regexes: Record<ServiceName, RegExp[]> = {
    frontend: [
      /import\.meta\.env\.([A-Z0-9_]+)/g,
      /process\.env(?:\[['"])?([A-Z0-9_]+)(?:['"])?/g,
    ],
    backend: [/process\.env(?:\[['"])?([A-Z0-9_]+)(?:['"])?/g],
    ml: [/os\.(?:environ\.get|getenv)\(['"]([A-Z0-9_]+)['"]\)/g, /env=['"]([A-Z0-9_]+)['"]/g],
  };

  for (const [file, content] of fileContents.entries()) {
    const hits: string[] = [];
    for (const pattern of regexes[service]) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const variable = match[1];
        if (!variable) continue;
        hits.push(variable);
        if (ENV_CONTRACT.includes(variable)) {
          seen.add(variable);
        } else {
          extras.add(variable);
        }
      }
    }

    if (hits.length > 0) {
      for (const variable of hits) {
        const current = usages[variable] ?? [];
        current.push(file);
        usages[variable] = [...new Set(current)].sort();
      }
    }
  }

  const present = ENV_CONTRACT.filter((name) => seen.has(name));
  const missing = ENV_CONTRACT.filter((name) => !seen.has(name));

  return {
    usages,
    present,
    missing,
    extras: [...extras].filter((name) => !ENV_CONTRACT.includes(name)).sort(),
  };
}

async function detectEnvVarUsage() {
  const result: Record<ServiceName, EnvScanResult> = {
    frontend: { usages: {}, present: [], missing: [...ENV_CONTRACT], extras: [] },
    backend: { usages: {}, present: [], missing: [...ENV_CONTRACT], extras: [] },
    ml: { usages: {}, present: [], missing: [...ENV_CONTRACT], extras: [] },
  };

  for (const service of Object.keys(SERVICE_FILE_GLOBS) as ServiceName[]) {
    const patterns = SERVICE_FILE_GLOBS[service];
    const files = await globby(patterns, { cwd: ROOT, gitignore: true });
    const cache = new Map<string, string>();

    for (const relativePath of files) {
      const absolutePath = path.join(ROOT, relativePath);
      const content = await readFileSafe(absolutePath);
      cache.set(toPosix(relativePath), content);
    }

    result[service] = scanEnvVariables(service, cache);
  }

  return result;
}

async function detectServiceFiles() {
  const entries: Record<string, string[]> = {};
  for (const [key, patterns] of Object.entries(SERVICE_ENTRY_GLOBS)) {
    const matches = await collectFiles(patterns);
    entries[key] = matches.sort();
  }
  return entries;
}

async function detectEnvFiles() {
  const envFiles = await collectFiles(['**/.env*', '!node_modules/**', '!**/*.example'], { dot: true });
  const dotenvUsage = await collectFiles([
    '**/*.{ts,tsx,js,jsx,py}',
    '!node_modules/**',
    '!backend/node_modules/**',
    '!**/dist/**',
  ]);

  const references: string[] = [];

  for (const file of dotenvUsage) {
    const content = await readFileSafe(path.join(ROOT, file));
    if (/(dotenv|load_dotenv|\.env)/.test(content)) {
      references.push(file);
    }
  }

  return {
    envFiles: envFiles.sort(),
    references: [...new Set(references)].sort(),
  };
}

async function detectHardcodedUrls() {
  const files = await globby(
    ['**/*.{ts,tsx,js,jsx,py}', '!node_modules/**', '!backend/node_modules/**', '!**/dist/**'],
    { cwd: ROOT, gitignore: true },
  );
  const urls: Record<string, string[]> = {};

  for (const file of files) {
    const absolutePath = path.join(ROOT, file);
    const content = await readFileSafe(absolutePath);
    const matches = content.match(/https?:\/\/[^\s'"`]+/g);
    if (matches && matches.length > 0) {
      const sanitized = [...new Set(matches)]
        .map((value) => value.replace(/[;,]+$/, ''))
        .filter((value) => value.length > 0 && !value.includes('${'))
        .sort();
      if (sanitized.length > 0) {
        urls[toPosix(file)] = sanitized;
      }
    }
  }

  return urls;
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
  const serviceEntries = await detectServiceFiles();

  const portFacts = {
    frontend: await detectPorts('frontend', SERVICE_FILE_GLOBS.frontend, EXPECTED_PORTS.frontend),
    backend: await detectPorts('backend', SERVICE_FILE_GLOBS.backend, EXPECTED_PORTS.backend),
    ml: await detectPorts('ml', SERVICE_FILE_GLOBS.ml, EXPECTED_PORTS.ml),
  } as const;

  const endpoints = await detectHealthEndpoints([
    'backend/src/**/*.{ts,js}',
    'ml_service/**/*.py',
  ]);

  const envUsage = await detectEnvVarUsage();
  const envArtifacts = await detectEnvFiles();
  const hardcodedUrls = await detectHardcodedUrls();

  const blockers = Object.values(portFacts)
    .map((fact) => fact.blocker)
    .filter((item): item is string => Boolean(item));

  const facts = {
    generatedAt: new Date().toISOString(),
    serviceEntries,
    ports: portFacts,
    endpoints,
    envContract: ENV_CONTRACT,
    envUsage,
    envArtifacts,
    hardcodedUrls,
    blockers,
  };

  await writeJsonReport('infra-audit.json', facts);

  const remediation: string[] = [];

  remediation.push('Implement strict environment validation shared across backend and ML services, aligned with ENV contract.');
  remediation.push('Add deployment flags (replit vs self_hosted) to gate Docker/K8s assets and monitoring features.');
  remediation.push('Wire Redis REDIS_URL into backend cache and Celery broker/result, including smoke scripts.');
  remediation.push('Expose /health and /metrics endpoints in backend and ML services instrumented for Prometheus.');
  remediation.push('Harden secrets handling with gitleaks scanning and pre-commit hook enforcement.');
  remediation.push('Author Replit-first dev docs plus provider onboarding guides with smoke tests and rotation policies.');
  remediation.push('Ship self-host orchestration (Docker & K8s) guarded behind feature flags, with CI coverage.');

  await writePlan(remediation);

  if (blockers.length > 0) {
    console.warn('[repo-audit] Blockers detected:', blockers);
  }
}

main().catch((error) => {
  console.error('[repo-audit] Failed to generate infrastructure audit:', error);
  process.exit(1);
});
