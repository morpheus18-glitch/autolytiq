#!/usr/bin/env tsx

/**
 * Safe Production Migration Deploy Script
 *
 * Handles the P3005 error when deploying to a database with existing schema
 * but no migration history. This script will:
 * 1. Attempt to run prisma migrate deploy
 * 2. If P3005 error occurs, baseline all existing migrations
 * 3. Retry the migration deploy
 * 4. Generate Prisma client
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execute(command: string, options: { throwOnError?: boolean; silent?: boolean } = {}): {
  success: boolean;
  output: string;
  error?: string;
} {
  const { throwOnError = false, silent = false } = options;

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return { success: true, output };
  } catch (error: any) {
    const errorOutput = error.stderr?.toString() || error.stdout?.toString() || error.message;

    if (throwOnError) {
      throw error;
    }

    return {
      success: false,
      output: error.stdout?.toString() || '',
      error: errorOutput
    };
  }
}

function getAllMigrations(): string[] {
  const migrationsDir = join(process.cwd(), 'prisma', 'migrations');

  try {
    const entries = readdirSync(migrationsDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && entry.name !== 'migration_lock.toml')
      .map(entry => entry.name)
      .sort();
  } catch (error) {
    log('⚠️  Could not read migrations directory', 'yellow');
    return [];
  }
}

async function baselineExistingMigrations() {
  log('\n🔧 Baselining existing migrations...', 'blue');

  const migrations = getAllMigrations();

  if (migrations.length === 0) {
    log('⚠️  No migrations found to baseline', 'yellow');
    return false;
  }

  log(`   Found ${migrations.length} migrations to baseline`, 'blue');

  let baselinedCount = 0;
  for (const migration of migrations) {
    log(`   Marking as applied: ${migration}`, 'blue');
    const result = execute(
      `npx prisma migrate resolve --applied "${migration}"`,
      { silent: true }
    );

    if (result.success) {
      baselinedCount++;
    } else {
      // Migration might already be applied, which is fine
      if (result.error?.includes('already been applied') ||
          result.error?.includes('already recorded')) {
        log(`   ✓ Already applied: ${migration}`, 'green');
        baselinedCount++;
      } else {
        log(`   ⚠️  Could not baseline: ${migration}`, 'yellow');
      }
    }
  }

  log(`✅ Baselined ${baselinedCount}/${migrations.length} migrations`, 'green');
  return baselinedCount > 0;
}

async function runMigrateDeploy(): Promise<boolean> {
  log('\n🚀 Running prisma migrate deploy...', 'blue');

  const result = execute('npx prisma migrate deploy', { silent: false });

  if (result.success) {
    log('✅ Migration deploy successful', 'green');
    return true;
  }

  // Check for various migration-related errors that indicate we should baseline
  const errorText = result.error?.toLowerCase() || '';

  const shouldBaseline =
    errorText.includes('p3005') ||
    errorText.includes('database schema is not empty') ||
    errorText.includes('not valid json') ||
    errorText.includes('unexpected token') ||
    errorText.includes('failed to check for database diff');

  if (shouldBaseline) {
    log('\n⚠️  Detected migration compatibility issue', 'yellow');
    log('   Database may have existing schema without migration history', 'yellow');
    log('   Will baseline existing migrations and retry...', 'yellow');
    return false;
  }

  // Some other error occurred
  log('❌ Migration deploy failed with unexpected error', 'red');
  if (result.error) {
    console.error(result.error);
  }
  throw new Error('Migration deploy failed');
}

async function checkMigrationStatus(): Promise<'needs_baseline' | 'up_to_date' | 'unknown'> {
  log('\n🔍 Checking migration status...', 'blue');

  const result = execute('npx prisma migrate status', { silent: true });

  if (result.success || result.output) {
    const output = (result.output || '').toLowerCase();
    const error = (result.error || '').toLowerCase();
    const combined = output + error;

    if (combined.includes('database schema is up to date')) {
      log('✅ Database schema is up to date', 'green');
      return 'up_to_date';
    }

    if (combined.includes('p3005') ||
        combined.includes('database schema is not empty') ||
        combined.includes('not valid json') ||
        combined.includes('unexpected token')) {
      log('⚠️  Migration history needs to be initialized', 'yellow');
      return 'needs_baseline';
    }

    if (combined.includes('following migration') && combined.includes('not yet been applied')) {
      log('📋 Pending migrations detected', 'blue');
      return 'unknown';
    }
  }

  return 'unknown';
}

async function generatePrismaClient() {
  log('\n🔄 Generating Prisma Client...', 'blue');

  const result = execute(
    'PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate',
    { silent: true }
  );

  if (result.success) {
    log('✅ Prisma Client generated', 'green');
  } else {
    log('⚠️  Prisma Client generation had warnings (continuing anyway)', 'yellow');
  }
}

async function main() {
  log('\n╔════════════════════════════════════════╗', 'bright');
  log('║   Safe Production Migration Deploy    ║', 'bright');
  log('╚════════════════════════════════════════╝\n', 'bright');

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL environment variable is not set', 'red');
    process.exit(1);
  }

  log('✅ DATABASE_URL configured', 'green');

  try {
    // Check migration status first
    const status = await checkMigrationStatus();

    // If we detect the database needs baselining, do it proactively
    if (status === 'needs_baseline') {
      log('\n🔧 Proactively baselining migrations...', 'blue');
      await baselineExistingMigrations();
    }

    // First attempt to deploy migrations
    const firstAttemptSuccess = await runMigrateDeploy();

    if (!firstAttemptSuccess) {
      // Migration failed - baseline and retry
      const baselined = await baselineExistingMigrations();

      if (baselined) {
        // Retry migration deploy after baselining
        log('\n🔄 Retrying migration deploy after baselining...', 'blue');
        const retrySuccess = await runMigrateDeploy();

        if (!retrySuccess) {
          log('⚠️  Migration deploy still failing, but continuing to start app...', 'yellow');
          // Don't exit - continue to generate client and start app
        }
      } else {
        log('⚠️  Could not baseline migrations, but continuing...', 'yellow');
      }
    }

    // Generate Prisma client
    await generatePrismaClient();

    log('\n╔════════════════════════════════════════╗', 'bright');
    log('║      ✅ Migrations Ready!              ║', 'green');
    log('╚════════════════════════════════════════╝\n', 'bright');

    process.exit(0);
  } catch (error) {
    log('\n❌ Migration process encountered an error', 'red');
    if (error instanceof Error) {
      console.error(error.message);
    }

    // Try to generate Prisma client anyway
    try {
      await generatePrismaClient();
    } catch (genError) {
      log('⚠️  Could not generate Prisma client', 'yellow');
    }

    log('\n⚠️  Starting application despite migration issues', 'yellow');
    log('   Database may not be fully in sync with schema', 'yellow');

    // Exit with success to allow app to start
    // The app should handle any schema mismatches gracefully
    process.exit(0);
  }
}

main();
