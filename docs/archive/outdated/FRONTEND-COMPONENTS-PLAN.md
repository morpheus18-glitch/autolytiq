# Frontend Components - Revolutionary CRM Implementation Plan

**Date**: 2025-11-01
**Status**: Implementation Ready
**Priority**: Critical (Backend features need UI)

---

## Executive Summary

This document outlines **all frontend components** needed to support the revolutionary CRM backend features that have been designed and implemented.

### Backend Features Completed ✅
1. ✅ **Unified Customer Timeline** - Backend service + API endpoints
2. ✅ **Lead Intelligence Service** - 370 LOC sophisticated analytics
3. ✅ **Automation Engine** - 1095 LOC enterprise automation
4. ✅ **Activity Tracking** - 9 activity types fully supported
5. ✅ **Communication Service** - SMS, Email, Voice with Twilio/SendGrid

### Backend Features Designed 📐
1. 📐 **Adaptive Lead Scoring** - XGBoost ML model architecture
2. 📐 **Conversational Intelligence** - Speech-to-text + sentiment
3. 📐 **Auto-Personalized Messaging** - GPT-4 content generation
4. 📐 **Opportunity Forecasting** - Deal close prediction + SHAP

### Frontend Components Needed 🎨
**Total**: 15 major components + 30 sub-components
**Effort**: 200 hours (5 weeks)

---

## 1. Component Architecture Overview

```
src/features/crm/
├── timeline/
│   ├── CustomerTimeline.tsx         ★ PRIORITY 1
│   ├── TimelineEventCard.tsx
│   ├── TimelineFilters.tsx
│   ├── TimelineStats.tsx
│   └── hooks/
│       ├── useTimeline.ts
│       └── useTimelineSubscription.ts
│
├── leads/
│   ├── LeadScoreDisplay.tsx         ★ PRIORITY 1
│   ├── LeadScoreFactors.tsx
│   ├── LeadScoreHistory.tsx
│   ├── LeadPriorityBadge.tsx
│   └── LeadEngagementMeter.tsx
│
├── activities/
│   ├── ActivityFeed.tsx
│   ├── ActivityQuickLog.tsx
│   ├── ActivityTypeSelector.tsx
│   └── SmartTaskSuggestions.tsx     ★ AI-POWERED
│
├── communications/
│   ├── UnifiedInbox.tsx             ★ PRIORITY 2
│   ├── MessageComposer.tsx
│   ├── AIMessageSuggestions.tsx     ★ AI-POWERED
│   ├── SentimentIndicator.tsx       ★ AI-POWERED
│   └── ConversationTranscript.tsx   ★ AI-POWERED
│
├── deals/
│   ├── DealHealthMeter.tsx          ★ PRIORITY 2
│   ├── DealForecastChart.tsx        ★ AI-POWERED
│   ├── DealCoachingPanel.tsx        ★ AI-POWERED
│   ├── DealTimelineVisualization.tsx
│   └── OpportunityPipeline.tsx
│
├── analytics/
│   ├── LeadScoreTrends.tsx
│   ├── ConversionFunnel.tsx
│   ├── EngagementHeatmap.tsx
│   └── PredictiveInsights.tsx       ★ AI-POWERED
│
├── automation/
│   ├── AutomationRuleBuilder.tsx
│   ├── AutomationTriggerConfig.tsx
│   ├── AutomationActionEditor.tsx
│   └── AutomationExecutionLog.tsx
│
└── shared/
    ├── AIInsightCard.tsx
    ├── ConfidenceScore.tsx
    ├── LoadingSkeletons.tsx
    ├── EmptyStates.tsx
    └── ErrorBoundaries.tsx
```

---

## 2. Priority 1 Components (Week 1-2)

### 2.1 Customer Timeline Component ★★★★★

**File**: `src/features/crm/timeline/CustomerTimeline.tsx`

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useTimelineSubscription } from './hooks/useTimelineSubscription';

interface TimelineEvent {
  id: string;
  category: 'ACTIVITY' | 'COMMUNICATION' | 'APPOINTMENT' | 'DEAL' | 'SERVICE';
  type: string;
  title: string | null;
  body: string | null;
  occurredAt: string;
  actor: { firstName: string; lastName: string } | null;
  [key: string]: unknown;
}

interface CustomerTimelineProps {
  customerId: string;
  filters?: {
    categories?: string[];
    types?: string[];
    actorId?: string;
    fromDate?: Date;
    toDate?: Date;
  };
}

export function CustomerTimeline({ customerId, filters }: CustomerTimelineProps) {
  const { ref: loadMoreRef, inView } = useInView();

  // Infinite scroll query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['timeline', customerId, filters],
    queryFn: async ({ pageParam = null }) => {
      const params = new URLSearchParams({
        customerId,
        limit: '50',
        ...(pageParam ? { cursor: pageParam } : {}),
        ...(filters?.categories ? { categories: filters.categories.join(',') } : {}),
        ...(filters?.types ? { types: filters.types.join(',') } : {}),
        ...(filters?.actorId ? { actorId: filters.actorId } : {}),
      });

      const res = await fetch(`/api/timeline?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'X-Tenant': getTenantId(),
        },
      });

      if (!res.ok) throw new Error('Failed to fetch timeline');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30000, // 30 seconds
  });

  // Real-time updates via WebSocket
  useTimelineSubscription(customerId, (newEvent) => {
    queryClient.setQueryData(['timeline', customerId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        pages: [
          {
            events: [newEvent, ...old.pages[0].events],
            nextCursor: old.pages[0].nextCursor,
            hasMore: old.pages[0].hasMore,
          },
          ...old.pages.slice(1),
        ],
      };
    });
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const events = data?.pages.flatMap((page) => page.events) ?? [];

  if (status === 'loading') {
    return <TimelineLoadingSkeleton />;
  }

  if (status === 'error') {
    return <TimelineError />;
  }

  if (events.length === 0) {
    return <TimelineEmptyState />;
  }

  return (
    <div className="timeline-container">
      <TimelineHeader customerId={customerId} />
      <TimelineFilters filters={filters} onChange={setFilters} />

      <div className="timeline-list space-y-4">
        {events.map((event) => (
          <TimelineEventCard key={event.id} event={event} />
        ))}

        {hasNextPage && (
          <div ref={loadMoreRef} className="timeline-loader">
            {isFetchingNextPage ? <Spinner /> : 'Scroll for more'}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Sub-Components**:
- `TimelineEventCard.tsx` - Individual event card with icon, time, content
- `TimelineFilters.tsx` - Filter by category, type, date range, actor
- `TimelineStats.tsx` - Summary stats (total events, last interaction)
- `TimelineLoadingSkeleton.tsx` - Skeleton UI for loading state

**Effort**: 24 hours

---

### 2.2 Lead Score Display Component ★★★★★

**File**: `src/features/crm/leads/LeadScoreDisplay.tsx`

```typescript
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface LeadScoreDisplayProps {
  score: number;
  scoreDelta: number | null;
  factors: Array<{
    feature: string;
    reason: string;
    impact: number;
  }>;
  confidence: number;
  modelVersion: string;
}

export function LeadScoreDisplay({
  score,
  scoreDelta,
  factors,
  confidence,
  modelVersion,
}: LeadScoreDisplayProps) {
  const scoreColor =
    score >= 80 ? 'text-red-600 bg-red-50' :
    score >= 60 ? 'text-orange-600 bg-orange-50' :
    score >= 40 ? 'text-yellow-600 bg-yellow-50' :
    'text-gray-600 bg-gray-50';

  const scoreLabel =
    score >= 80 ? 'Hot Lead' :
    score >= 60 ? 'Warm Lead' :
    score >= 40 ? 'Medium Interest' :
    'Cold Lead';

  return (
    <div className="lead-score-card p-6 bg-white rounded-lg shadow">
      {/* Score Circle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${scoreColor}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <span className="text-2xl font-bold">{score}</span>
          </motion.div>

          <div>
            <h3 className="text-lg font-semibold">{scoreLabel}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {scoreDelta !== null && (
                <span className={`flex items-center ${scoreDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scoreDelta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(scoreDelta)}
                </span>
              )}
              <span>{Math.round(confidence * 100)}% confidence</span>
            </div>
          </div>
        </div>

        <LeadPriorityBadge score={score} />
      </div>

      {/* Top Factors */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Top Scoring Factors:</h4>
        {factors.slice(0, 5).map((factor, idx) => (
          <LeadScoreFactor key={idx} factor={factor} />
        ))}
      </div>

      {/* Recommended Actions */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Actions:</h4>
        <RecommendedActions score={score} factors={factors} />
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Model: {modelVersion} • Updated {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
```

**Sub-Components**:
- `LeadScoreFactor.tsx` - Individual factor with impact visualization
- `LeadPriorityBadge.tsx` - Visual priority indicator
- `LeadScoreHistory.tsx` - Chart showing score changes over time
- `RecommendedActions.tsx` - AI-suggested next steps

**Effort**: 16 hours

---

### 2.3 Deal Health Meter Component ★★★★☆

**File**: `src/features/crm/deals/DealHealthMeter.tsx`

```typescript
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface DealHealthMeterProps {
  dealId: string;
  health: {
    score: number;        // 0-100
    status: 'healthy' | 'at-risk' | 'critical';
    factors: Array<{
      factor: string;
      status: 'good' | 'warning' | 'critical';
      message: string;
    }>;
    lastUpdated: string;
  };
}

export function DealHealthMeter({ dealId, health }: DealHealthMeterProps) {
  const statusConfig = {
    healthy: { color: 'bg-green-500', icon: CheckCircle, text: 'Healthy' },
    'at-risk': { color: 'bg-yellow-500', icon: Clock, text: 'At Risk' },
    critical: { color: 'bg-red-500', icon: AlertCircle, text: 'Critical' },
  };

  const config = statusConfig[health.status];

  return (
    <div className="deal-health-meter p-4 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <config.icon className={`w-6 h-6 ${config.color.replace('bg-', 'text-')}`} />
          <div>
            <h3 className="font-semibold">Deal Health</h3>
            <p className="text-sm text-gray-600">{config.text}</p>
          </div>
        </div>

        <div className="text-2xl font-bold">
          {health.score}
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>

      <Progress value={health.score} className="mb-4" />

      <div className="space-y-2">
        {health.factors.map((factor, idx) => (
          <DealHealthFactor key={idx} factor={factor} />
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Last updated {formatDistanceToNow(new Date(health.lastUpdated), { addSuffix: true })}
      </div>
    </div>
  );
}
```

**Sub-Components**:
- `DealHealthFactor.tsx` - Individual health factor indicator
- `DealHealthHistory.tsx` - Chart of health over time
- `DealRiskAlerts.tsx` - Critical alerts and warnings

**Effort**: 12 hours

---

## 3. Priority 2 Components (Week 3-4)

### 3.1 Unified Inbox Component

**File**: `src/features/crm/communications/UnifiedInbox.tsx`

Consolidates SMS, Email, Calls into single threaded view.

**Features**:
- Multi-channel message threading
- Sentiment indicators
- Quick reply with AI suggestions
- Search and filtering
- Real-time updates

**Effort**: 20 hours

---

### 3.2 AI Message Composer

**File**: `src/features/crm/communications/AIMessageComposer.tsx`

AI-powered message generation with GPT-4.

**Features**:
- Template selection
- AI-generated personalized content
- Tone adjustment (professional, friendly, urgent)
- Preview and edit
- Send tracking

**Effort**: 16 hours

---

### 3.3 Conversation Transcript Viewer

**File**: `src/features/crm/communications/ConversationTranscript.tsx`

Real-time call transcription with sentiment analysis.

**Features**:
- Live transcription display
- Sentiment indicators per turn
- Speaker identification
- Key moment highlights
- Searchable transcript

**Effort**: 16 hours

---

## 4. Supporting Components (Week 5)

### 4.1 Analytics Components
- `LeadScoreTrends.tsx` - Score distribution and trends
- `ConversionFunnel.tsx` - Conversion rate by score bucket
- `EngagementHeatmap.tsx` - Activity heatmap by day/hour
- `PredictiveInsights.tsx` - AI-generated insights

**Effort**: 24 hours

---

### 4.2 Automation Components
- `AutomationRuleBuilder.tsx` - Visual rule builder
- `AutomationTriggerConfig.tsx` - Trigger configuration
- `AutomationActionEditor.tsx` - Action editor
- `AutomationExecutionLog.tsx` - Execution history

**Effort**: 20 hours

---

### 4.3 Shared Components
- `AIInsightCard.tsx` - Reusable AI insight card
- `ConfidenceScore.tsx` - Confidence indicator
- `LoadingSkeletons.tsx` - Skeleton screens
- `EmptyStates.tsx` - Empty state illustrations
- `ErrorBoundaries.tsx` - Error handling

**Effort**: 12 hours

---

## 5. Hooks & Utilities

### Custom Hooks

```typescript
// useTimeline.ts
export function useTimeline(customerId: string, filters?: TimelineFilters) {
  return useInfiniteQuery({...});
}

// useTimelineSubscription.ts
export function useTimelineSubscription(customerId: string, onEvent: (event) => void) {
  useEffect(() => {
    socket.on('timeline:event', handler);
    return () => socket.off('timeline:event', handler);
  }, [customerId, onEvent]);
}

// useLeadScore.ts
export function useLeadScore(leadId: string) {
  return useQuery({
    queryKey: ['leadScore', leadId],
    queryFn: () => fetchLeadScore(leadId),
    refetchInterval: 60000, // Refresh every minute
  });
}

// useLeadScoreSubscription.ts
export function useLeadScoreSubscription(leadId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (payload) => {
      if (payload.leadId === leadId) {
        queryClient.setQueryData(['leadScore', leadId], payload);
      }
    };

    socket.on('lead:scoreUpdated', handler);
    return () => socket.off('lead:scoreUpdated', handler);
  }, [leadId]);
}

// useDealHealth.ts
export function useDealHealth(dealId: string) {
  return useQuery({
    queryKey: ['dealHealth', dealId],
    queryFn: () => fetchDealHealth(dealId),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
```

---

## 6. State Management

### React Query Configuration

```typescript
// lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### WebSocket Integration

```typescript
// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  query: {
    tenantId: getTenantId(),
  },
  auth: {
    token: getAuthToken(),
  },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('[Socket] Connected');
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected');
});
```

---

## 7. Design System Integration

### Using Design Tokens (131 CSS Variables)

From verification results: "131 CSS design tokens detected"

```typescript
// Design tokens already integrated via packages/tokens
import '@repo/tokens/dist/tokens.css';

// Usage in components
<div className="bg-[var(--color-background-primary)]">
  <h1 className="text-[var(--color-text-primary)]">
    Customer Timeline
  </h1>
</div>
```

### Component Library

```typescript
// Using shadcn/ui components (already in codebase)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog } from '@/components/ui/dialog';
```

---

## 8. Implementation Timeline

### Week 1: Timeline & Lead Scoring (48h)
- ✅ CustomerTimeline component + hooks
- ✅ LeadScoreDisplay component
- ✅ WebSocket subscriptions
- ✅ Loading states & error handling

### Week 2: Deal Health & Inbox (40h)
- ✅ DealHealthMeter component
- ✅ UnifiedInbox component
- ✅ Message threading
- ✅ Real-time updates

### Week 3: AI Features (32h)
- ✅ AIMessageComposer
- ✅ ConversationTranscript
- ✅ AI Insights cards
- ✅ Sentiment indicators

### Week 4: Analytics & Automation (36h)
- ✅ LeadScoreTrends
- ✅ ConversionFunnel
- ✅ AutomationRuleBuilder
- ✅ Execution logs

### Week 5: Polish & Optimization (44h)
- ✅ Empty states
- ✅ Error boundaries
- ✅ Loading skeletons
- ✅ Mobile responsive
- ✅ Performance optimization
- ✅ Accessibility (WCAG 2.1 AA)

**Total Effort**: 200 hours (5 weeks)

---

## 9. Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
describe('CustomerTimeline', () => {
  it('renders timeline events', () => {
    render(<CustomerTimeline customerId="test-123" />);
    expect(screen.getByText('Customer Timeline')).toBeInTheDocument();
  });

  it('loads more events on scroll', async () => {
    const { container } = render(<CustomerTimeline customerId="test-123" />);
    const loadMoreTrigger = container.querySelector('.timeline-loader');

    fireEvent.scroll(loadMoreTrigger);

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(50);
    });
  });
});
```

### Integration Tests (Playwright)

```typescript
test('Timeline real-time updates', async ({ page }) => {
  await page.goto('/customers/cust-123');

  // Wait for timeline
  await page.waitForSelector('.timeline-list');
  const initialCount = await page.locator('.timeline-event').count();

  // Simulate new event via API
  await createActivity({ customerId: 'cust-123', type: 'NOTE' });

  // Verify real-time update
  await page.waitForSelector('.timeline-event:has-text("NOTE")');
  const updatedCount = await page.locator('.timeline-event').count();

  expect(updatedCount).toBe(initialCount + 1);
});
```

---

## 10. Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const CustomerTimeline = lazy(() => import('./features/crm/timeline/CustomerTimeline'));
const DealHealthMeter = lazy(() => import('./features/crm/deals/DealHealthMeter'));
const ConversationTranscript = lazy(() => import('./features/crm/communications/ConversationTranscript'));

// Usage with Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <CustomerTimeline customerId={id} />
</Suspense>
```

### Virtual Scrolling (for long timelines)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedTimeline({ events }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <TimelineEventCard
            key={virtualRow.index}
            event={events[virtualRow.index]}
          />
        ))}
      </div>
    </div>
  );
}
```

### Memoization

```typescript
const MemoizedTimelineEventCard = memo(TimelineEventCard, (prev, next) => {
  return prev.event.id === next.event.id && prev.event.occurredAt === next.event.occurredAt;
});
```

---

## 11. Deployment Checklist

### Pre-Deployment
- [ ] All components built and tested
- [ ] WebSocket connections verified
- [ ] API endpoints tested
- [ ] Design tokens applied
- [ ] Mobile responsive
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance audit (Lighthouse > 90)

### Deployment
- [ ] Build frontend: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Build Docker image
- [ ] Push to registry
- [ ] Deploy to Kubernetes
- [ ] Verify health checks
- [ ] Monitor logs

### Post-Deployment
- [ ] Smoke test critical paths
- [ ] Monitor error rates
- [ ] Check WebSocket connections
- [ ] Verify real-time updates
- [ ] User acceptance testing

---

## 12. Success Metrics

### Technical Metrics
- ✅ Component load time: <200ms
- ✅ Timeline scroll: 60 FPS
- ✅ Real-time latency: <100ms
- ✅ Bundle size: <500KB (gzipped)
- ✅ Lighthouse score: >90

### Business Metrics
- 📊 User adoption: 80%+ within 2 weeks
- 📊 Session duration: +40% (more engagement)
- 📊 Feature usage: Timeline (90%), Lead Score (85%), Inbox (75%)
- 📊 User satisfaction: >4.5/5
- 📊 Support tickets: -25% (better UX)

---

## Summary

### Components Completed
1. ✅ Backend Timeline Service (API ready)
2. ✅ Backend Lead Scoring (API ready)
3. ✅ Backend Automation (API ready)

### Components To Build
1. 🎨 CustomerTimeline (48h)
2. 🎨 LeadScoreDisplay (16h)
3. 🎨 DealHealthMeter (12h)
4. 🎨 UnifiedInbox (20h)
5. 🎨 AIMessageComposer (16h)
6. 🎨 ConversationTranscript (16h)
7. 🎨 Analytics suite (24h)
8. 🎨 Automation UI (20h)
9. 🎨 Supporting components (28h)

**Total Effort**: 200 hours
**Timeline**: 5 weeks
**Team**: 2 frontend developers

**Status**: Ready for Sprint Planning

---

**Created**: 2025-11-01
**Last Updated**: 2025-11-01
**Version**: 1.0.0
