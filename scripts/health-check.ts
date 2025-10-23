#!/usr/bin/env tsx

/**
 * Health Check CLI Tool
 *
 * Runs a comprehensive health check on the application
 * Useful for monitoring and deployment verification
 */

import { performHealthCheck } from '../server/services/health-check';

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

async function main() {
  log('\n╔════════════════════════════════════════╗', 'bright');
  log('║     Application Health Check Tool     ║', 'bright');
  log('╚════════════════════════════════════════╝\n', 'bright');

  try {
    const health = await performHealthCheck();

    log(`Status: ${health.status.toUpperCase()}`, health.status === 'healthy' ? 'green' : health.status === 'degraded' ? 'yellow' : 'red');
    log(`Timestamp: ${health.timestamp}`, 'blue');
    log(`Uptime: ${Math.round(health.uptime)}s`, 'blue');
    log(`Environment: ${health.environment}`, 'blue');

    log('\n📊 System Checks:', 'bright');

    // Database Check
    log('\n🗄️  Database:', 'bright');
    if (health.checks.database.healthy) {
      log(`  ✅ Status: Healthy`, 'green');
      log(`  ⏱️  Latency: ${health.checks.database.latency}ms`, 'blue');
      log(`  🔧 Provider: ${health.checks.database.provider}`, 'blue');
    } else {
      log(`  ❌ Status: Unhealthy`, 'red');
      log(`  ⚠️  Error: ${health.checks.database.error}`, 'red');
    }

    // Memory Check
    log('\n💾 Memory:', 'bright');
    if (health.checks.memory.healthy) {
      log(`  ✅ Status: Healthy`, 'green');
    } else {
      log(`  ⚠️  Status: High Usage`, 'yellow');
    }
    log(`  📈 Used: ${health.checks.memory.used}MB / ${health.checks.memory.total}MB (${health.checks.memory.percentage}%)`, 'blue');

    // Process Check
    log('\n⚙️  Process:', 'bright');
    log(`  ✅ Status: Running`, 'green');
    log(`  🆔 PID: ${health.checks.process.pid}`, 'blue');
    log(`  ⏱️  Uptime: ${health.checks.process.uptime}s`, 'blue');

    log('\n╔════════════════════════════════════════╗', 'bright');
    if (health.status === 'healthy') {
      log('║        ✅ All Systems Operational       ║', 'green');
    } else if (health.status === 'degraded') {
      log('║      ⚠️  System Performance Degraded   ║', 'yellow');
    } else {
      log('║          ❌ System Unhealthy           ║', 'red');
    }
    log('╚════════════════════════════════════════╝\n', 'bright');

    process.exit(health.status === 'healthy' ? 0 : 1);
  } catch (error) {
    log('\n❌ Health check failed', 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
