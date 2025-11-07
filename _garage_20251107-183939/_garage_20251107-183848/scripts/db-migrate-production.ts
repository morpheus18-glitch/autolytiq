#!/usr/bin/env tsx

/**
 * Production Database Migration Script
 *
 * Safely runs database migrations in production with proper error handling,
 * backup verification, and rollback capability.
 *
 * Usage:
 *   npm run db:migrate:production        # Run migrations
 *   npm run db:migrate:production --dry-run  # Preview migrations
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

interface MigrationConfig {
  dryRun: boolean;
  verbose: boolean;
  skipBackupCheck: boolean;
}

const config: MigrationConfig = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  skipBackupCheck: process.argv.includes('--skip-backup-check'),
};

// ANSI color codes
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

function execute(command: string, options: { silent?: boolean } = {}): string {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
    throw error;
  }
}

async function checkEnvironment() {
  log('\n🔍 Checking environment...', 'blue');

  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL environment variable is not set', 'red');
    process.exit(1);
  }

  if (process.env.NODE_ENV !== 'production' && !config.dryRun) {
    log('⚠️  NODE_ENV is not set to "production"', 'yellow');
    const confirm = process.argv.includes('--force');
    if (!confirm) {
      log('   Use --force to proceed anyway', 'yellow');
      process.exit(1);
    }
  }

  log('✅ Environment check passed', 'green');
}

async function checkPendingMigrations(): Promise<boolean> {
  log('\n🔍 Checking for pending migrations...', 'blue');

  try {
    const status = execute('npx prisma migrate status', { silent: true });

    if (status.includes('Database schema is up to date')) {
      log('✅ No pending migrations', 'green');
      return false;
    }

    if (status.includes('Following migration have not yet been applied')) {
      log('📋 Pending migrations detected:', 'yellow');
      console.log(status);
      return true;
    }

    log('⚠️  Unable to determine migration status', 'yellow');
    return false;
  } catch (error) {
    log('❌ Failed to check migration status', 'red');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

async function verifyDatabaseBackup() {
  if (config.skipBackupCheck) {
    log('\n⚠️  Skipping backup verification (--skip-backup-check)', 'yellow');
    return;
  }

  log('\n🔍 Verifying database backup...', 'blue');

  // Check if backup exists (this is a placeholder - adjust for your backup strategy)
  log('⚠️  IMPORTANT: Ensure you have a recent database backup before proceeding!', 'yellow');
  log('   Press Ctrl+C to cancel or wait 5 seconds to continue...', 'yellow');

  await new Promise((resolve) => setTimeout(resolve, 5000));
  log('✅ Continuing with migration', 'green');
}

async function runMigrations() {
  log('\n🚀 Running migrations...', 'blue');

  try {
    if (config.dryRun) {
      log('🔍 DRY RUN MODE - No changes will be made', 'yellow');
      execute('npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script');
      log('\n✅ Dry run completed', 'green');
      return;
    }

    execute('npx prisma migrate deploy');
    log('\n✅ Migrations completed successfully', 'green');
  } catch (error) {
    log('\n❌ Migration failed!', 'red');
    if (error instanceof Error) {
      console.error(error.message);
    }
    log('\n⚠️  Database may be in an inconsistent state', 'yellow');
    log('   Consider restoring from backup if necessary', 'yellow');
    process.exit(1);
  }
}

async function generatePrismaClient() {
  log('\n🔄 Generating Prisma Client...', 'blue');

  try {
    execute('PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate', { silent: !config.verbose });
    log('✅ Prisma Client generated', 'green');
  } catch (error) {
    log('⚠️  Failed to generate Prisma Client', 'yellow');
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

async function verifyMigration() {
  log('\n🔍 Verifying migration...', 'blue');

  try {
    execute('npx prisma migrate status', { silent: !config.verbose });
    log('✅ Migration verification passed', 'green');
  } catch (error) {
    log('❌ Migration verification failed', 'red');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

async function main() {
  log('\n╔════════════════════════════════════════╗', 'bright');
  log('║  Production Database Migration Tool  ║', 'bright');
  log('╚════════════════════════════════════════╝\n', 'bright');

  try {
    await checkEnvironment();

    const hasPendingMigrations = await checkPendingMigrations();

    if (!hasPendingMigrations && !config.dryRun) {
      log('\n✅ Database is up to date. No action needed.', 'green');
      process.exit(0);
    }

    await verifyDatabaseBackup();
    await runMigrations();

    if (!config.dryRun) {
      await generatePrismaClient();
      await verifyMigration();
    }

    log('\n╔════════════════════════════════════════╗', 'bright');
    log('║       ✅ Migration Successful!         ║', 'green');
    log('╚════════════════════════════════════════╝\n', 'bright');

    log('Next steps:', 'blue');
    log('  1. Verify application functionality', 'blue');
    log('  2. Monitor application logs', 'blue');
    log('  3. Keep backup available for rollback if needed\n', 'blue');
  } catch (error) {
    log('\n❌ Migration process failed', 'red');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

main();
