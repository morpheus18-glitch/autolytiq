#!/usr/bin/env tsx

/**
 * Performance Benchmarking Script
 *
 * Measures performance of critical operations to identify bottlenecks
 *
 * Usage:
 *   npm run benchmark
 *   npm run benchmark -- --iterations 1000
 */

import { performance } from 'perf_hooks';
import { FuelType, VehicleType } from '@prisma/client';
import { prisma, runWithTenant } from '../lib/prisma.js';

interface BenchmarkResult {
  operation: string;
  iterations: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
}

function calculateStats(times: number[]): Omit<BenchmarkResult, 'operation' | 'iterations'> {
  const sorted = [...times].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
}

async function benchmarkOperation(
  name: string,
  operation: () => Promise<void>,
  iterations: number,
): Promise<BenchmarkResult> {
  const times: number[] = [];

  // Warm-up
  await operation();

  // Run benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await operation();
    const duration = performance.now() - start;
    times.push(duration);
  }

  const stats = calculateStats(times);

  return {
    operation: name,
    iterations,
    ...stats,
  };
}

async function setupTestData(tenantId: string) {
  // Create test customer if not exists
  const customer = await prisma.customer.findFirst({
    where: { tenantId, email: 'benchmark@test.com' },
  });

  if (!customer) {
    await runWithTenant(tenantId, async () => {
      await prisma.customer.create({
        data: {
          tenantId,
          firstName: 'Benchmark',
          lastName: 'Test',
          email: 'benchmark@test.com',
          phone: '555-0000',
        },
      });
    });
  }

  // Create test vehicle if not exists
  const vehicle = await prisma.vehicle.findFirst({
    where: { tenantId, vin: 'BENCHMARK000000000' },
  });

  if (!vehicle) {
    await runWithTenant(tenantId, async () => {
      await prisma.vehicle.create({
        data: {
          tenantId,
          vin: 'BENCHMARK000000000',
          stockNumber: 'BENCH-001',
          year: 2024,
          make: 'Test',
          model: 'Benchmark',
          type: VehicleType.NEW,
          fuelType: FuelType.GASOLINE,
          invoiceCost: 20000,
          listPrice: 25000,
        },
      });
    });
  }
}

async function benchmarkDatabase(tenantId: string, iterations: number): Promise<BenchmarkResult[]> {
  await setupTestData(tenantId);

  const results: BenchmarkResult[] = [];

  // Benchmark: Simple query
  results.push(
    await benchmarkOperation(
      'Database: Simple SELECT',
      async () => {
        await runWithTenant(tenantId, async () => {
          await prisma.customer.findFirst({
            where: { email: 'benchmark@test.com' },
          });
        });
      },
      iterations,
    ),
  );

  // Benchmark: Query with relations
  results.push(
    await benchmarkOperation(
      'Database: Query with relations',
      async () => {
        await runWithTenant(tenantId, async () => {
          await prisma.customer.findFirst({
            where: { email: 'benchmark@test.com' },
            include: {
              leads: true,
              activities: true,
            },
          });
        });
      },
      iterations,
    ),
  );

  // Benchmark: List query
  results.push(
    await benchmarkOperation(
      'Database: List query (10 records)',
      async () => {
        await runWithTenant(tenantId, async () => {
          await prisma.customer.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
          });
        });
      },
      iterations,
    ),
  );

  // Benchmark: Search query
  results.push(
    await benchmarkOperation(
      'Database: Search query',
      async () => {
        await runWithTenant(tenantId, async () => {
          await prisma.customer.findMany({
            where: {
              OR: [
                { firstName: { contains: 'Bench', mode: 'insensitive' } },
                { lastName: { contains: 'Bench', mode: 'insensitive' } },
                { email: { contains: 'bench', mode: 'insensitive' } },
              ],
            },
            take: 10,
          });
        });
      },
      iterations,
    ),
  );

  return results;
}

async function benchmarkPaymentCalculations(iterations: number): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  // Benchmark: Payment calculation
  results.push(
    await benchmarkOperation(
      'Calculation: Monthly payment',
      async () => {
        const principal = 25000;
        const apr = 5.99 / 100;
        const term = 60;
        const monthlyRate = apr / 12;

        // Standard amortization formula
        const payment =
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
          (Math.pow(1 + monthlyRate, term) - 1);

        // Use payment to avoid optimization
        if (payment < 0) throw new Error('Invalid');
      },
      iterations,
    ),
  );

  // Benchmark: Complex deal calculation
  results.push(
    await benchmarkOperation(
      'Calculation: Deal gross calculation',
      async () => {
        const vehiclePrice = 25000;
        const cost = 20000;
        const tradeAllowance = 8000;
        const tradePayoff = 6000;
        const docFee = 499;
        const warranties = [
          { cost: 1200, retail: 1800 },
          { cost: 800, retail: 1200 },
        ];

        const frontGross = vehiclePrice - cost;
        const tradeGross = tradePayoff - tradeAllowance;
        const backGross = warranties.reduce((sum, w) => sum + (w.retail - w.cost), 0);
        const totalGross = frontGross + tradeGross + backGross + docFee;

        if (totalGross < 0) throw new Error('Invalid');
      },
      iterations,
    ),
  );

  return results;
}

function printResults(results: BenchmarkResult[]): void {
  console.log('\n' + '═'.repeat(100));
  console.log('📊 PERFORMANCE BENCHMARK RESULTS');
  console.log('═'.repeat(100));
  console.log('\n');

  console.log(
    '┌─────────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐',
  );
  console.log(
    '│ Operation                               │   Min    │   Mean   │  Median  │   P95    │   P99    │   Max    │',
  );
  console.log(
    '├─────────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤',
  );

  for (const result of results) {
    const operation = result.operation.padEnd(39);
    const min = result.min.toFixed(2).padStart(6) + 'ms';
    const mean = result.mean.toFixed(2).padStart(6) + 'ms';
    const median = result.median.toFixed(2).padStart(6) + 'ms';
    const p95 = result.p95.toFixed(2).padStart(6) + 'ms';
    const p99 = result.p99.toFixed(2).padStart(6) + 'ms';
    const max = result.max.toFixed(2).padStart(6) + 'ms';

    console.log(`│ ${operation} │ ${min} │ ${mean} │ ${median} │ ${p95} │ ${p99} │ ${max} │`);
  }

  console.log(
    '└─────────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘',
  );

  console.log('\n' + '═'.repeat(100));
  console.log('🎯 PERFORMANCE ASSESSMENT');
  console.log('═'.repeat(100));

  // Identify slow operations (P95 > 100ms)
  const slowOps = results.filter((r) => r.p95 > 100);

  if (slowOps.length > 0) {
    console.log('\n⚠️  Operations with P95 > 100ms:');
    slowOps.forEach((op) => {
      console.log(`   • ${op.operation}: ${op.p95.toFixed(2)}ms`);
    });
    console.log('\n   Recommendation: Investigate these operations for optimization opportunities.');
  } else {
    console.log('\n✅ All operations are performing well (P95 < 100ms)');
  }

  // Identify very slow operations (P95 > 500ms)
  const verySlow = results.filter((r) => r.p95 > 500);
  if (verySlow.length > 0) {
    console.log('\n🚨 CRITICAL: Operations with P95 > 500ms:');
    verySlow.forEach((op) => {
      console.log(`   • ${op.operation}: ${op.p95.toFixed(2)}ms`);
    });
    console.log('\n   Action Required: These operations need immediate optimization.');
  }

  console.log('\n');
}

async function main() {
  const args = process.argv.slice(2);
  let iterations = 100;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      iterations = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help') {
      console.log(`
Performance Benchmarking Script

Usage:
  benchmark [options]

Options:
  --iterations <n>   Number of iterations per benchmark (default: 100)
  --help             Show this help message

Examples:
  benchmark
  benchmark --iterations 1000
`);
      process.exit(0);
    }
  }

  console.log(`\n🏃 Running benchmarks with ${iterations} iterations...\n`);

  try {
    // Get first tenant for testing
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.error('❌ No tenants found. Please seed the database first.');
      process.exit(1);
    }

    const allResults: BenchmarkResult[] = [];

    // Run database benchmarks
    console.log('📦 Benchmarking database operations...');
    const dbResults = await benchmarkDatabase(tenant.id, iterations);
    allResults.push(...dbResults);

    // Run calculation benchmarks
    console.log('🧮 Benchmarking calculations...');
    const calcResults = await benchmarkPaymentCalculations(iterations * 10); // More iterations for fast ops
    allResults.push(...calcResults);

    // Print results
    printResults(allResults);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Benchmark error:', error);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
