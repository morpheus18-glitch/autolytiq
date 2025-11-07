# Deal Studio Scaffolding

## Overview
Placeholder implementation of the Deal Studio workspace as described in `DEAL_STUDIO_DESIGN_PLAN.md`.

## Structure

```
deal/
├── DealStudioDesktop.tsx        # Main desktop layout (3-panel)
├── components/
│   └── PaymentPanel.tsx         # Payment simulator with lock functionality
├── hooks/
│   └── usePaymentLock.ts        # Payment lock state management
└── index.ts                     # Barrel export
```

## Usage

```typescript
import { DealStudioDesktop } from '@/screens/deal';

function DealPage() {
  const { id } = useParams();
  return <DealStudioDesktop dealId={id} />;
}
```

## Current Features

### Payment Lock ✅
- Lock target monthly payment
- Disable payment input when locked
- Unlock to adjust
- Console logging for debugging

### Three-Panel Layout ✅
- Left: Customer Dossier (placeholder)
- Center: Payment Simulator (functional)
- Right: AI Companion (placeholder)

## Not Yet Implemented

- [ ] Sliders for down payment, term, rate
- [ ] Real-time Rust pricing calculation
- [ ] AI recommendations
- [ ] Sensitivity analysis charts
- [ ] "Stage This Deal" workflow
- [ ] Mobile responsive layout
- [ ] WebSocket integration for live updates

## Design Tokens Used

From `@repo/ui`:
- `border-border-base` - Panel borders
- `text-text-secondary` - Label text
- `accent-primary` - Lock indicator
- Grid system: `grid-cols-1 lg:grid-cols-3`

## Integration Points

### Future: Rust Pricing Engine
```typescript
// Will call /api/pricing/calculate
const { payment } = await calculatePayment({
  salePrice,
  downPayment,
  term,
  rate
});
```

### Future: AI Companion
```typescript
// Will use GraphQL subscription
const { recommendations } = useAIRecommendations(dealId);
```

## Testing

To verify:
1. Import components compile without errors
2. Payment lock/unlock behavior works
3. Three-panel layout renders correctly

## Notes

- All imports use `.js` extension (ESM)
- Uses existing `@repo/ui` components only
- No external dependencies added
- TypeScript strict mode compatible
