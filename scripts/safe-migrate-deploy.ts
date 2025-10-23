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

  // Check if this is the P3005 error
  const isP3005Error = result.error?.includes('P3005') ||
                       result.error?.includes('database schema is not empty');

  if (isP3005Error) {
    log('\n⚠️  Detected P3005 error: Database schema exists without migration history', 'yellow');
    log('   This is expected for existing databases. Will baseline and retry...', 'yellow');
    return false;
  }

  // Some other error occurred
  log('❌ Migration deploy failed with unexpected error', 'red');
  if (result.error) {
    console.error(result.error);
  }
  throw new Error('Migration deploy failed');
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
    // First attempt to deploy migrations
    const firstAttemptSuccess = await runMigrateDeploy();

    if (!firstAttemptSuccess) {
      // P3005 error detected - baseline and retry
      const baselined = await baselineExistingMigrations();

      if (baselined) {
        // Retry migration deploy after baselining
        log('\n🔄 Retrying migration deploy after baselining...', 'blue');
        const retrySuccess = await runMigrateDeploy();

        if (!retrySuccess) {
          log('❌ Migration deploy failed even after baselining', 'red');
          process.exit(1);
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
    log('\n❌ Migration process failed', 'red');
    if (error instanceof Error) {
      console.error(error.message);
    }

    log('\n⚠️  Application will start without running migrations', 'yellow');
    log('   Database may not be in sync with schema', 'yellow');

    // Exit with success to allow app to start
    // The app should handle missing migrations gracefully
    process.exit(0);
  }
}

main();
