# @repo/insights-engine

A rule-based insight engine that evaluates domain events to generate actionable insights for dealership operations.

## Overview

The Insight Engine consumes domain events from `@repo/state-bus` and evaluates them against registered rules to produce actionable insights. Each insight includes severity levels, quick actions, and metadata to help dealership staff prioritize and respond to operational issues.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Insight Engine                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐      ┌─────────────────┐                │
│  │   Registry    │──────│  Rule Evaluator │                │
│  │  (Widgets)    │      │   (Core Engine) │                │
│  └───────────────┘      └─────────────────┘                │
│         │                        │                          │
│         │                        ▼                          │
│         │               ┌─────────────────┐                │
│         │               │  Memory Store   │                │
│         │               │  (Event Buffer) │                │
│         │               └─────────────────┘                │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌────────────────────────────────────────┐                │
│  │           Rule Modules                  │                │
│  ├────────────────────────────────────────┤                │
│  │  • deal-funding-risk                   │                │
│  │  • recon-stalled                       │                │
│  │  • title-delay-risk                    │                │
│  │  • lead-revisit-opportunity            │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    @repo/state-bus
                   (Domain Events)
```

## Installation

```bash
pnpm add @repo/insights-engine
```

## Usage

### Basic Usage

```typescript
import { startEngine } from '@repo/insights-engine';

// Start the insight engine for a tenant
const cleanup = startEngine({
  tenantId: 'tenant-123',
  evaluationIntervalMs: 30000, // Evaluate every 30 seconds
});

// Later, stop the engine
cleanup();
```

### Manual Evaluation

```typescript
import { evaluate } from '@repo/insights-engine';
import type { DomainEvent } from '@repo/state-bus';

const events: DomainEvent[] = [
  // Your domain events
];

const results = evaluate(events);

results.forEach(result => {
  console.log(`Widget: ${result.widgetId}`);
  console.log(`Insights: ${result.insights.length}`);

  result.insights.forEach(insight => {
    console.log(`- [${insight.severity}] ${insight.summary}`);
  });
});
```

### Working with Insights

```typescript
import type { Insight } from '@repo/insights-engine';

// Insight structure
const insight: Insight = {
  id: 'funding-risk-deal123',
  type: 'deal.fundingAtRisk',
  severity: 'high', // 'low' | 'normal' | 'high' | 'critical'
  status: 'new',    // 'new' | 'acknowledged' | 'snoozed' | 'resolved'
  summary: 'Deal #deal123 funding at risk - 50hrs in CIT',
  entityRef: {
    type: 'deal',
    id: 'deal123',
  },
  quickAction: {
    label: 'View Deal',
    action: 'navigate',
    params: { path: '/deals/deal123' },
  },
  createdAt: '2025-11-07T10:00:00Z',
  metadata: {
    hoursSince: 50,
    originalState: 'pending',
  },
};
```

## Built-in Rules

### 1. Deal Funding Risk

**Widget ID**: `deal-funding-risk`

**Trigger**: Deal in `pending_funding` state for > 48 hours

**Severity**:
- `high`: 48-72 hours
- `critical`: > 72 hours

**Quick Action**: Navigate to deal details

**Use Case**: Alert F&I managers of deals at risk of funding delays or lender issues.

---

### 2. Recon Stalled

**Widget ID**: `recon-stalled`

**Trigger**: Repair Order in `recon` or `pending_parts` state for > 10 days

**Severity**:
- `normal`: 10-20 days
- `high`: > 20 days

**Quick Action**: Navigate to RO details

**Use Case**: Alert recon managers of vehicles stuck in reconditioning process.

---

### 3. Title Delay Risk

**Widget ID**: `title-delay-risk`

**Trigger**: Title received but not filed after > 7 days

**Severity**:
- `high`: 7-14 days
- `critical`: > 14 days

**Quick Action**: Open title filing modal

**Use Case**: Alert title clerks of compliance risks from unfiled titles.

---

### 4. Lead Revisit Opportunity

**Widget ID**: `lead-revisit`

**Trigger**: Deal created 24-48 hours ago with no follow-up

**Severity**: `normal`

**Quick Action**: Navigate to deal for follow-up

**Use Case**: Prompt BDC/sales managers to follow up with recent leads.

## Creating Custom Rules

### 1. Create a Rule File

```typescript
// packages/insights-engine/src/rules/my-custom-rule.ts
import type { DomainEvent } from '@repo/state-bus';
import type { Insight } from '../signal-model.js';
import { registerWidget } from '../registry.js';

function evaluateMyCustomRule(events: DomainEvent[]): Insight[] {
  const insights: Insight[] = [];

  // Your rule logic here
  const relevantEvents = events.filter(e => e.type === 'vehicle.aged');

  for (const event of relevantEvents) {
    const daysInInventory = event.payload?.daysInInventory || 0;

    if (daysInInventory > 60) {
      insights.push({
        id: `aged-inventory-${event.entityId}`,
        type: 'inventory.aged',
        severity: daysInInventory > 90 ? 'high' : 'normal',
        status: 'new',
        summary: `Vehicle ${event.entityId.slice(0, 8)} aged ${daysInInventory} days`,
        entityRef: {
          type: 'vehicle',
          id: event.entityId,
        },
        quickAction: {
          label: 'View Vehicle',
          action: 'navigate',
          params: { path: `/inventory/${event.entityId}` },
        },
        createdAt: new Date().toISOString(),
        metadata: { daysInInventory },
      });
    }
  }

  return insights;
}

// Register the widget
registerWidget('my-custom-rule', {
  id: 'my-custom-rule',
  type: 'insight-widget',
  label: 'My Custom Rule',
  description: 'Description of what this rule does',
  evaluator: evaluateMyCustomRule,
});
```

### 2. Register Your Rule

Add your rule to `src/rules/index.ts`:

```typescript
import './my-custom-rule.js';
export * from './my-custom-rule.js';
```

### 3. Build and Test

```bash
pnpm build
pnpm typecheck
```

## API Reference

### Types

#### `Insight`

```typescript
interface Insight {
  id: string;
  type: string;
  severity: 'low' | 'normal' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'snoozed' | 'resolved';
  summary: string;
  entityRef: {
    type: 'deal' | 'ro' | 'vehicle' | 'title';
    id: string;
  };
  quickAction?: {
    label: string;
    action: string;
    params?: Record<string, any>;
  };
  createdAt: string;
  metadata?: Record<string, any>;
}
```

#### `WidgetDefinition`

```typescript
interface WidgetDefinition {
  id: string;
  type: string;
  label: string;
  description?: string;
  evaluator: (events: DomainEvent[]) => Insight[];
}
```

### Functions

#### `startEngine(options: EngineOptions)`

Start the insight engine with periodic evaluation.

**Parameters**:
- `options.tenantId` (string): Tenant ID to subscribe to
- `options.evaluationIntervalMs` (number, optional): Evaluation interval in milliseconds (default: 30000)

**Returns**: Cleanup function

#### `evaluate(events: DomainEvent[])`

Manually evaluate rules against a set of events.

**Returns**: `EvaluationResult[]`

#### `registerWidget(id: string, definition: WidgetDefinition)`

Register a new insight widget.

#### `getAllWidgets()`

Get all registered widgets.

**Returns**: `WidgetDefinition[]`

#### `getWidget(id: string)`

Get a specific widget by ID.

**Returns**: `WidgetDefinition | undefined`

## Testing

Run the included test suite:

```bash
pnpm test  # or: npx tsx test-rules.ts
```

Example output:

```
=== Insight Engine Rules Test ===

✓ Registered widgets: 4
  - deal-funding-risk: Deal Funding Risk
  - recon-stalled: Recon Stalled
  - title-delay-risk: Title Delay Risk
  - lead-revisit: Lead Revisit Opportunities

=== Testing Deal Funding Risk ===

Widget: deal-funding-risk
Insights found: 1
  - [high] Deal #deal-abc funding at risk - 50hrs in CIT
```

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Build
pnpm build

# Watch mode
pnpm dev
```

## Integration with State Bus

The Insight Engine subscribes to domain events from `@repo/state-bus`. Ensure you're publishing events correctly:

```typescript
import { publish, Channels } from '@repo/state-bus';

const event: DomainEvent = {
  id: 'evt-123',
  type: 'deal.stateChanged',
  tenantId: 'tenant-123',
  entityType: 'deal',
  entityId: 'deal-456',
  timestamp: new Date().toISOString(),
  userId: 'user-789',
  payload: {
    dealId: 'deal-456',
    fromState: 'pending',
    toState: 'pending_funding',
    triggeredBy: 'user-789',
  },
};

publish(Channels.tenant('tenant-123'), event);
```

## Performance Considerations

- **Event Buffer**: The memory store keeps the most recent 1000 events
- **Evaluation Interval**: Default 30 seconds (configurable)
- **Rule Complexity**: Each rule should complete evaluation in < 100ms
- **Memory Usage**: Approximately 1-2MB for 1000 events

## Future Enhancements

- [ ] Persistent insight storage (database)
- [ ] WebSocket streaming for real-time updates
- [ ] Rule priority and ordering
- [ ] Insight deduplication
- [ ] Time-based insight expiration
- [ ] Machine learning-based insights
- [ ] Custom notification channels (email, SMS, Slack)

## License

Private - Autolytiq Platform
