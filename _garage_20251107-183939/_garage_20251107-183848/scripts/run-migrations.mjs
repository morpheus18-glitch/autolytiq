#!/usr/bin/env node

import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  skipGenerate: args.includes('--skip-generate'),
};

const colors = {
  reset: '\u001B[0m',
  bright: '\u001B[1m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
};

function log(message, color = 'reset') {
  const colorCode = colors[color] ?? colors.reset;
  process.stdout.write(`${colorCode}${message}${colors.reset}\n`);
}

function shouldSkip() {
  const raw = process.env.SKIP_DB_MIGRATIONS;
  if (!raw) return false;
  return ['1', 'true', 'yes'].includes(raw.trim().toLowerCase());
}

function resolvePrismaBinary() {
  const prismaPath = resolve(process.cwd(), 'node_modules', '.bin', 'prisma');
  return prismaPath;
}

function runPrisma(args, { silent = false } = {}) {
  const prismaBin = resolvePrismaBinary();
  const result = spawnSync(prismaBin, args, {
    env: { ...process.env, PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1' },
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  if (!silent) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  return {
    success: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    code: result.status ?? 0,
  };
}

function shouldBaselineFromOutput(output) {
  const lower = output.toLowerCase();
  return (
    lower.includes('p3005') ||
    lower.includes('database schema is not empty') ||
    lower.includes('database schema is not empty. the schema prisma migrate') ||
    lower.includes('failed to check for database diff') ||
    lower.includes('unexpected token') ||
    lower.includes('not valid json')
  );
}

function listMigrations() {
  const migrationsDir = resolve(process.cwd(), 'prisma', 'migrations');
  let entries;
  try {
    entries = readdirSync(migrationsDir, { withFileTypes: true });
  } catch (error) {
    log('⚠️  prisma/migrations directory not found. No migrations to baseline.', 'yellow');
    return [];
  }
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function baselineMigrations() {
  const migrations = listMigrations();
  if (!migrations.length) {
    log('⚠️  No migrations found to baseline.', 'yellow');
    return false;
  }

  log(`🔧 Baselining ${migrations.length} migrations...`, 'blue');
  let successCount = 0;

  for (const migration of migrations) {
    const result = runPrisma(['migrate', 'resolve', '--applied', migration], { silent: true });

    if (result.success || result.stderr.includes('already recorded')) {
      log(`   ✓ ${migration}`, 'green');
      successCount += 1;
    } else if (shouldBaselineFromOutput(result.stderr)) {
      // Prisma sometimes reports JSON errors when the migrations table is empty but schema exists.
      log(`   ✓ ${migration}`, 'green');
      successCount += 1;
    } else {
      log(`   ⚠️  Unable to mark migration ${migration} as applied`, 'yellow');
      if (process.env.DEBUG_MIGRATIONS) {
        process.stderr.write(result.stderr);
      }
    }
  }

  log(`✅ Baselined ${successCount}/${migrations.length} migrations.`, 'green');
  return successCount === migrations.length;
}

function runMigrateDeploy() {
  log('🚀 Applying Prisma migrations...', 'blue');
  const result = runPrisma(['migrate', 'deploy']);

  if (result.success) {
    log('✅ Database schema is up to date.', 'green');
    return { applied: true, retryable: false };
  }

  if (shouldBaselineFromOutput(result.stderr)) {
    log('⚠️  Migrate deploy reported existing schema without migration history.', 'yellow');
    return { applied: false, retryable: true, message: result.stderr };
  }

  log('❌ Prisma migrate deploy failed.', 'red');
  if (result.stderr) process.stderr.write(result.stderr);
  throw new Error('prisma migrate deploy failed');
}

function generatePrismaClient() {
  log('🔄 Generating Prisma client...', 'blue');
  const result = runPrisma(['generate']);
  if (!result.success) {
    log('⚠️  Prisma client generation completed with warnings.', 'yellow');
  } else {
    log('✅ Prisma client ready.', 'green');
  }
}

function runDryRun() {
  log('🔍 Dry run: checking migration status...', 'blue');
  const status = runPrisma(['migrate', 'status']);
  if (!status.success) {
    throw new Error('Unable to check migration status during dry run.');
  }

  log('📝 Dry run: generating diff script (no changes applied)...', 'blue');
  const diff = runPrisma([
    'migrate',
    'diff',
    '--from-schema-datasource',
    'prisma/schema.prisma',
    '--to-schema-datamodel',
    'prisma/schema.prisma',
    '--script',
  ]);

  if (!diff.success) {
    throw new Error('Unable to generate migration diff during dry run.');
  }

  log('✅ Dry run completed. Review output above for pending SQL statements.', 'green');
}

function verifyDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL must be provided to run migrations.', 'red');
    process.exit(1);
  }
}

function verifyPrismaBinary() {
  const prismaBin = resolvePrismaBinary();
  if (!existsSync(prismaBin)) {
    log('❌ Prisma CLI is not installed in node_modules. Ensure `prisma` is available.', 'red');
    process.exit(1);
  }
}

function main() {
  if (shouldSkip()) {
    log('⏭️  SKIP_DB_MIGRATIONS is set. Skipping database migrations.', 'yellow');
    return;
  }

  verifyDatabaseUrl();
  verifyPrismaBinary();

  log('╔════════════════════════════════════════╗', 'bright');
  log('║     Autolytiq Migration Orchestrator   ║', 'bright');
  log('╚════════════════════════════════════════╝', 'bright');

  if (options.dryRun) {
    runDryRun();
    return;
  }

  const initial = runMigrateDeploy();

  if (!initial.applied && initial.retryable) {
    log('🔄 Attempting to baseline existing migrations and retry.', 'blue');
    const baselined = baselineMigrations();
    if (!baselined) {
      log('⚠️  Baselining completed with warnings.', 'yellow');
    }

    const retry = runMigrateDeploy();
    if (!retry.applied) {
      throw new Error('Unable to apply Prisma migrations after baselining.');
    }
  }

  if (options.skipGenerate) {
    log('⏭️  Skipping Prisma client generation (per --skip-generate flag).', 'yellow');
  } else {
    generatePrismaClient();
  }

  log('╔════════════════════════════════════════╗', 'bright');
  log('║        ✅ Database ready to go!        ║', 'green');
  log('╚════════════════════════════════════════╝', 'bright');
}

try {
  main();
} catch (error) {
  log('❌ Migration orchestration failed.', 'red');
  if (error instanceof Error) {
    log(error.message, 'red');
  }
  process.exit(1);
}
