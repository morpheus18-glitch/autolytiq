/**
 * Test script to verify insight rules work correctly
 */

import type { DomainEvent } from '@repo/state-bus';
import { getAllWidgets } from './src/registry.js';
import { evaluate } from './src/rules-core.js';

// Import rules to trigger registration
import './src/rules/index.js';

console.log('\n=== Insight Engine Rules Test ===\n');

// Check widget registration
const widgets = getAllWidgets();
console.log(`✓ Registered widgets: ${widgets.length}`);
widgets.forEach(w => {
  console.log(`  - ${w.id}: ${w.label}`);
});

console.log('\n=== Testing Deal Funding Risk ===\n');

// Create test events - deal stuck in pending_funding for 50 hours
const now = new Date();
const fiftyHoursAgo = new Date(now.getTime() - 50 * 60 * 60 * 1000);

const testEvents: DomainEvent[] = [
  {
    id: 'evt-001',
    type: 'deal.stateChanged',
    tenantId: 'tenant-123',
    entityType: 'deal',
    entityId: 'deal-abc123',
    timestamp: fiftyHoursAgo.toISOString(),
    userId: 'user-001',
    payload: {
      dealId: 'deal-abc123',
      fromState: 'pending',
      toState: 'pending_funding',
      triggeredBy: 'user-001',
    },
  },
];

const results = evaluate(testEvents);

console.log('Evaluation results:');
results.forEach(result => {
  console.log(`\nWidget: ${result.widgetId}`);
  console.log(`Insights found: ${result.insights.length}`);
  result.insights.forEach(insight => {
    console.log(`  - [${insight.severity}] ${insight.summary}`);
    console.log(`    Type: ${insight.type}`);
    console.log(`    Quick Action: ${insight.quickAction?.label}`);
  });
});

console.log('\n=== Testing Title Delay ===\n');

const sevenDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

const titleEvents: DomainEvent[] = [
  {
    id: 'evt-002',
    type: 'title.received',
    tenantId: 'tenant-123',
    entityType: 'title',
    entityId: 'title-xyz789',
    timestamp: sevenDaysAgo.toISOString(),
    userId: 'user-002',
    payload: {
      titleId: 'title-xyz789',
      vehicleId: 'vehicle-456',
      receivedAt: sevenDaysAgo.toISOString(),
    },
  },
];

const titleResults = evaluate(titleEvents);
console.log('Title delay results:');
titleResults.forEach(result => {
  if (result.insights.length > 0) {
    console.log(`\nWidget: ${result.widgetId}`);
    result.insights.forEach(insight => {
      console.log(`  - [${insight.severity}] ${insight.summary}`);
    });
  }
});

console.log('\n=== Testing Recon Stalled ===\n');

const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

const reconEvents: DomainEvent[] = [
  {
    id: 'evt-003',
    type: 'ro.stateChanged',
    tenantId: 'tenant-123',
    entityType: 'ro',
    entityId: 'ro-999',
    timestamp: fifteenDaysAgo.toISOString(),
    userId: 'user-003',
    payload: {
      roId: 'ro-999',
      fromState: 'open',
      toState: 'recon',
      stateChangedAt: fifteenDaysAgo.toISOString(),
    },
  },
];

const reconResults = evaluate(reconEvents);
console.log('Recon stalled results:');
reconResults.forEach(result => {
  if (result.insights.length > 0) {
    console.log(`\nWidget: ${result.widgetId}`);
    result.insights.forEach(insight => {
      console.log(`  - [${insight.severity}] ${insight.summary}`);
      console.log(`    Days since: ${insight.metadata?.daysSince?.toFixed(1)}`);
    });
  }
});

console.log('\n=== Testing Lead Revisit ===\n');

const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);

const leadEvents: DomainEvent[] = [
  {
    id: 'evt-004',
    type: 'deal.created',
    tenantId: 'tenant-123',
    entityType: 'deal',
    entityId: 'deal-new123',
    timestamp: thirtyHoursAgo.toISOString(),
    userId: 'user-004',
    payload: {
      dealId: 'deal-new123',
      customerId: 'customer-555',
      vehicleId: 'vehicle-888',
      salesPersonId: 'user-004',
      state: 'pending',
      value: 35000,
    },
  },
];

const leadResults = evaluate(leadEvents);
console.log('Lead revisit results:');
leadResults.forEach(result => {
  if (result.insights.length > 0) {
    console.log(`\nWidget: ${result.widgetId}`);
    result.insights.forEach(insight => {
      console.log(`  - [${insight.severity}] ${insight.summary}`);
      console.log(`    Hours since: ${insight.metadata?.hoursSince?.toFixed(1)}`);
    });
  }
});

console.log('\n=== Test Complete ===\n');
