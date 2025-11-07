# Autolytiq Deal Studio - Comprehensive Design Plan

> **📋 Related Documentation**: This design plan focuses on UX/UI vision. For technical implementation details, code snippets, and API specifications, see [`/DEAL_STUDIO_IMPLEMENTATION_PLAN.md`](/DEAL_STUDIO_IMPLEMENTATION_PLAN.md).

## Vision Statement

**The Autolytiq Deal Studio is not a calculator. It's a cockpit.**

Transform deal desking from a "dead" form-filling exercise into a **live, interactive mission control** for vehicle negotiations. Powered by Rust for instant calculations and AI for intelligent guidance, this is where salespeople orchestrate deals with the precision of a financial trader and the intelligence of a strategic advisor.

---

## Core Philosophy: The "Alive" Experience

### What Makes It "Alive"

1. **No "Calculate" Button** - Every input change triggers instant feedback (< 100ms via Rust)
2. **Real-Time Simulation** - Sliders and inputs feel like physical levers controlling a machine
3. **Payment Lock** - Lock the target payment, adjust other levers to find the deal structure
4. **AI Co-Pilot** - Proactive suggestions appear as you work, not on-demand
5. **Stage This Deal** - AI recommendations instantly animate into the simulator
6. **Paste to Chat** - Seamless handoff from desking to customer communication
7. **Context-Aware** - Pulls live data from CRM, DMS, Inventory, Chat history

### Design Principle: "Mission Control, Not Form"

- **Desktop**: Three-panel cockpit - everything visible at once
- **Mobile**: Context-aware tabbed studio launched from DM chat
- **Always**: Single-screen experience - no page navigation during negotiation

---

## Part 1: Desktop Experience - The Three-Panel Cockpit

### Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Autolytiq Deal Studio                                    [Minimize]│
├───────────────┬─────────────────────────────┬─────────────────────┤
│               │                             │                     │
│   PANEL 1     │        PANEL 2              │     PANEL 3         │
│   Customer    │   Live Desking Simulator    │   AI Companion      │
│   Dossier     │   (Powered by Rust)         │   (Powered by ML)   │
│   (The Past)  │   (The Present)             │   (The Future)      │
│               │                             │                     │
│   25% width   │        50% width            │    25% width        │
│               │                             │                     │
└───────────────┴─────────────────────────────┴─────────────────────┘
```

### Panel 1 (Left): Customer Dossier - "The Past"

**Purpose:** Source of truth providing context for AI recommendations

**Width:** 25% of viewport (collapsible to icon bar)

**Sections:**

1. **Customer Profile**
   ```
   ┌─────────────────────────────┐
   │  [Avatar] Jane Doe          │
   │  ★★★★☆ 730 FICO            │
   │  📱 (555) 123-4567          │
   │  ✉️  jane@email.com         │
   │                             │
   │  Status: Hot Lead           │
   │  Stage: Negotiation         │
   └─────────────────────────────┘
   ```

2. **Financial Summary**
   - Credit Score (color-coded badge)
   - Annual Income
   - DTI Ratio
   - Max Payment Capacity (calculated)
   - Pre-approval Status

3. **Vehicle Context**
   ```
   ┌─────────────────────────────┐
   │  2024 Ford F-150 Lariat     │
   │  [Vehicle Image]            │
   │                             │
   │  Cost:      $32,450         │
   │  MSRP:      $48,900         │
   │  Days on Lot: 58            │
   │  Margin:    $16,450         │
   └─────────────────────────────┘
   ```

4. **Recent Activity**
   - Last DM: "Hoping to make a deal today"
   - Last Interaction: 15 min ago
   - Showroom Visits: 3
   - Test Drives: 1

5. **Trade-In Summary** (if applicable)
   - Vehicle: 2019 Chevy Silverado
   - Estimated Value: $22,000
   - Payoff: $18,500
   - Net Equity: $3,500

**Design:**
- Muted background (`bg-slate-50 dark:bg-slate-900`)
- Read-only data cards
- Compact, scannable format
- Sticky header with customer name
- Collapse button to icon bar for more screen space

---

### Panel 2 (Center): Live Desking Simulator - "The Present"

**Purpose:** Real-time deal structuring with instant feedback

**Width:** 50% of viewport (expandable to 75% when Panel 1 collapsed)

**The Hero Component: Live Payment Display**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            MONTHLY PAYMENT                      │
│                                                 │
│              $542.10                            │
│              ════════                           │
│                                                 │
│  [🔒 Lock Payment]                              │
│                                                 │
│  Based on: 60 months @ 5.99% APR               │
└─────────────────────────────────────────────────┘
```

**Layout: The Four Main Levers**

1. **Vehicle Price Slider**
   ```
   ┌──────────────────────────────────────────────┐
   │  Vehicle Price                   $45,900     │
   │  ─────────────●──────────────────────────    │
   │  MSRP: $48,900  │  Cost: $32,450             │
   │  Margin: $13,450                             │
   └──────────────────────────────────────────────┘
   ```

2. **Down Payment Slider**
   ```
   ┌──────────────────────────────────────────────┐
   │  Down Payment                    $3,500      │
   │  ─────────●──────────────────────────────    │
   │  Min: $0        │  Suggested: $4,589         │
   └──────────────────────────────────────────────┘
   ```

3. **Trade-In Value / Payoff**
   ```
   ┌──────────────────────────────────────────────┐
   │  Trade-In Value                  $22,000     │
   │  ─────────────────●──────────────────────    │
   │                                              │
   │  Trade Payoff                    $18,500     │
   │  ─────────────────────●──────────────────    │
   │                                              │
   │  Net Trade Equity:  $3,500                   │
   └──────────────────────────────────────────────┘
   ```

4. **Term & APR Control**
   ```
   ┌──────────────────────────────────────────────┐
   │  Term (months)                                │
   │  [36] [48] [60✓] [72] [84]                   │
   │                                              │
   │  APR (%)                         5.99%       │
   │  ─────────────●──────────────────────────    │
   │  Best Rate: 4.99% (See Lenders →)           │
   └──────────────────────────────────────────────┘
   ```

**The "Rust Magic" Interactions**

1. **Real-Time Updates:**
   - Every slider movement → Rust service call → Payment updates in < 100ms
   - Smooth number animations (not jumpy)
   - Visual feedback: Brief glow on payment number when updating

2. **Payment Lock Feature:**
   ```
   User clicks [🔒 Lock Payment at $500]
   ↓
   Payment display turns BLUE with lock icon
   ↓
   Now when user moves Down Payment slider UP:
   → Rust service calculates required Vehicle Price adjustment
   → Vehicle Price slider automatically animates DOWN
   → Payment stays locked at $500
   ↓
   User can see: "To hit $500/mo with $4,000 down,
                  vehicle price must be $42,800"
   ```

3. **Visual Indicators:**
   - 🟢 Green: Profitable deal (above min margin)
   - 🟡 Yellow: Marginal deal (near min margin)
   - 🔴 Red: Unprofitable deal (below min margin)
   - ⚡ Blue pulse: Rust service calculating
   - 🔒 Blue lock icon: Payment locked

**Additional Controls Below Sliders**

5. **F&I Products Section**
   ```
   ┌──────────────────────────────────────────────┐
   │  F&I Products (Back-End Profit)              │
   │                                              │
   │  [✓] Extended Warranty    $2,495  (+$748)   │
   │  [✓] GAP Insurance        $595    (+$178)   │
   │  [ ] Maintenance Plan     $1,800  (+$540)   │
   │  [ ] Paint Protection     $1,295  (+$388)   │
   │                                              │
   │  Back-End Profit: $926                       │
   └──────────────────────────────────────────────┘
   ```

**Deal Summary Card (Always Visible at Bottom)**

```
┌─────────────────────────────────────────────────────┐
│  DEAL STRUCTURE                                     │
│                                                     │
│  Vehicle Price:      $45,900                        │
│  Down Payment:       $3,500                         │
│  Net Trade:          $3,500                         │
│  Amount Financed:    $38,900                        │
│  F&I Products:       $3,090                         │
│  ─────────────────────────────────────────────      │
│  Total Financed:     $42,890                        │
│                                                     │
│  Front-End Profit:   $13,450    🟢                  │
│  Back-End Profit:    $926       🟢                  │
│  Total Gross:        $14,376    🟢                  │
│                                                     │
│  [Save Deal]  [Export to PDF]  [Send to Customer]  │
└─────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Background: White/light gradient
- Sliders: Large hit targets (48px height minimum)
- Numbers: Monospace font, large size
- Payment display: `text-6xl font-bold font-mono`
- Smooth animations: `transition-all duration-200`
- Card-based sections with subtle shadows
- Generous spacing for clarity

---

### Panel 3 (Right): AI Companion - "The Future"

**Purpose:** Proactive AI co-pilot providing strategic guidance

**Width:** 25% of viewport (expandable to 50% for detailed view)

**Layout: Conversational Feed Interface**

```
┌─────────────────────────────────────┐
│  🧠 AI Desking Companion            │
│  ─────────────────────────────────  │
│                                     │
│  [Customer's offer input box]      │
│  "Enter customer's offer..."        │
│  [Analyze]                          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [AI Response Cards Feed]           │
│                                     │
└─────────────────────────────────────┘
```

**Initial Input Section**

```
┌─────────────────────────────────────┐
│  Customer's Opening Offer           │
│                                     │
│  Payment:  [$450]  /month          │
│  Down:     [$2,000]                │
│  Term:     [60] months             │
│                                     │
│  [🧠 Get AI Strategy]               │
└─────────────────────────────────────┘
```

**AI Response Card Format**

```
┌─────────────────────────────────────────────┐
│  🤖 AI Analysis                             │
│  ──────────────────────────────────────     │
│                                             │
│  "That offer is $1,150 below minimum        │
│  profit. Customer has 730 FICO and 60%      │
│  walk probability. Vehicle is 58 days       │
│  on lot - consider aggressive counter."     │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  💰 Strategy 1: MAX PROFIT                  │
│  ──────────────────────────────────────     │
│                                             │
│  Recommended Offer:                         │
│  • Payment: $495/month                      │
│  • Down Payment: $2,500                     │
│  • Term: 60 months                          │
│  • APR: 5.99%                               │
│                                             │
│  Talking Point:                             │
│  "We're close! To get to your payment,      │
│  we just need a bit more down. This gets    │
│  you into the truck today at $495."         │
│                                             │
│  Expected Outcome:                          │
│  • Close Probability: 55%  🟡              │
│  • Gross Profit: $2,100    🟢              │
│  • Approval Odds: 92%      🟢              │
│                                             │
│  [🚀 Stage This Deal]                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🎯 Strategy 2: BEST CLOSE                  │
│  ──────────────────────────────────────     │
│                                             │
│  Recommended Offer:                         │
│  • Payment: $470/month                      │
│  • Down Payment: $2,000                     │
│  • Term: 72 months (extended)               │
│  • APR: 5.99%                               │
│                                             │
│  Talking Point:                             │
│  "I can't do $450, but I can do $470        │
│  right now, and you keep your down          │
│  payment. Deal?"                            │
│                                             │
│  Expected Outcome:                          │
│  • Close Probability: 85%  🟢              │
│  • Gross Profit: $1,600    🟡              │
│  • Approval Odds: 94%      🟢              │
│                                             │
│  [🚀 Stage This Deal]                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ⚖️ Strategy 3: BALANCED                    │
│  ──────────────────────────────────────     │
│                                             │
│  Recommended Offer:                         │
│  • Payment: $485/month                      │
│  • Down Payment: $2,250                     │
│  • Term: 60 months                          │
│  • Add: GAP Insurance ($595)                │
│                                             │
│  Talking Point:                             │
│  "Let's meet in the middle at $485. I'll    │
│  throw in GAP insurance to protect your     │
│  investment."                               │
│                                             │
│  Expected Outcome:                          │
│  • Close Probability: 72%  🟢              │
│  • Gross Profit: $1,875    🟢              │
│  • Approval Odds: 93%      🟢              │
│                                             │
│  [🚀 Stage This Deal]                       │
└─────────────────────────────────────────────┘
```

**"Stage This Deal" Interaction**

When salesperson clicks `[🚀 Stage This Deal]`:

1. **Visual Animation Sequence:**
   - AI card highlights with blue glow
   - Panel 2 (Simulator) attracts attention with subtle pulse
   - All sliders/inputs animate smoothly to new positions:
     - Vehicle Price slider slides to new value
     - Down Payment slider adjusts
     - Term buttons switch
     - F&I checkboxes update
   - Payment display animates to new number
   - Deal Summary updates
   - Success toast: "✓ Deal staged from AI recommendation"

2. **State Management:**
   - Simulator state updated with AI-suggested values
   - Deal marked as "AI-Assisted" for tracking
   - Can undo with "Revert to Manual" button
   - All changes still editable by salesperson

**Additional AI Features**

```
┌─────────────────────────────────────────────┐
│  📊 Deal History Insights                   │
│  ──────────────────────────────────────     │
│                                             │
│  Similar deals closed:                      │
│  • 12 deals on this vehicle type            │
│  • Avg close at $482/mo, $2,300 down        │
│  • 68% close rate with 72-month term        │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ⚠️ Warnings                                 │
│  ──────────────────────────────────────     │
│                                             │
│  • High LTV (95%) - Consider larger down    │
│  • PTI approaching 20% - Payment sensitive  │
│  • Customer previously walked at $500/mo    │
│                                             │
└─────────────────────────────────────────────┘
```

**Design Specifications:**
- Background: Subtle purple/blue gradient (`from-purple-50 to-blue-50`)
- Cards: White with colored left border (green/blue/orange per strategy)
- Feed layout: Newest at top, scroll for history
- Sticky input at top
- Smooth scroll animations when new cards appear
- Badge colors: Green (good), Yellow (caution), Red (concern)

---

## Part 2: Mobile Experience - The Tabbed Studio

### Entry Point: Launch from DM/Chat

**Context:** Salesperson is in DM conversation with customer

**Home Base Screen: DM Chat Interface**

```
┌─────────────────────────────────────┐
│  ← Jane Doe                     •••  │
├─────────────────────────────────────┤
│                                     │
│  [Customer messages]                │
│                                     │
│  Jane: "Can you do $450/month?"     │
│  ────────────────────────        3m │
│                                     │
│  You: "Let me run some numbers..."  │
│  ────────────────────────────────   │
│                                  1m │
│                                     │
│  [Type a message...]                │
│  ──────────────────────────────     │
│                                     │
│  [💬]  [📷]  [💰 Desk]  [Send]      │
└─────────────────────────────────────┘
```

**Entry Point:** Tap `[💰 Desk]` button in chat input bar

**Result:** Full-screen Deal Studio modal slides up from bottom

---

### The Mobile Deal Studio Layout

```
┌─────────────────────────────────────┐
│  ─────                              │  ← Drag handle
│                                     │
│  [Compact Dossier Header]           │  ← Sticky
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [ 🚀 Simulator ] [ 🧠 AI Coach ]   │  ← Tab control
│  ═════════════                      │
│                                     │
│  [Active Tab Content]               │
│                                     │
│                                     │
│  (Scrollable)                       │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Paste to Chat]  [Close]           │  ← Sticky footer
└─────────────────────────────────────┘
```

### Compact Dossier Header (Sticky)

```
┌─────────────────────────────────────┐
│  Jane Doe • 730 FICO                │
│  2024 F-150 • $48,900 • 58 days     │
│  [ℹ️ Details]                        │
└─────────────────────────────────────┘
```

Tapping `[ℹ️ Details]` expands full dossier in a slide-up drawer.

---

### Tab 1: 🚀 Simulator (Mobile Version)

**Focus:** Touch-first, large hit targets, vertical layout

**Live Payment Display (Top)**

```
┌─────────────────────────────────────┐
│                                     │
│       MONTHLY PAYMENT               │
│                                     │
│         $542.10                     │
│         ═══════                     │
│                                     │
│  [🔒 Lock at $500]                  │
│                                     │
│  60 months @ 5.99% APR              │
│                                     │
└─────────────────────────────────────┘
```

**Deal Levers (Vertical Stack)**

1. **Vehicle Price**
   ```
   ┌──────────────────────────────────┐
   │  Vehicle Price                   │
   │                                  │
   │         $45,900                  │
   │  ────────●───────────────────    │
   │                                  │
   │  MSRP: $48,900                   │
   │  Margin: $13,450 🟢             │
   └──────────────────────────────────┘
   ```

2. **Down Payment**
   ```
   ┌──────────────────────────────────┐
   │  Down Payment                    │
   │                                  │
   │         $3,500                   │
   │  ───●────────────────────────    │
   │                                  │
   │  Suggested: $4,589               │
   └──────────────────────────────────┘
   ```

3. **Trade-In**
   ```
   ┌──────────────────────────────────┐
   │  Trade-In                        │
   │                                  │
   │  Value:    $22,000               │
   │  Payoff:   $18,500               │
   │  ─────────────────────           │
   │  Net Equity: $3,500 🟢          │
   └──────────────────────────────────┘
   ```

4. **Term & APR**
   ```
   ┌──────────────────────────────────┐
   │  Term                            │
   │  [36] [48] [60✓] [72] [84]       │
   │                                  │
   │  APR                             │
   │         5.99%                    │
   │  ───────●────────────────────    │
   └──────────────────────────────────┘
   ```

5. **F&I Products**
   ```
   ┌──────────────────────────────────┐
   │  F&I Products                    │
   │                                  │
   │  [✓] Warranty      $2,495        │
   │  [✓] GAP          $595           │
   │  [ ] Maintenance   $1,800        │
   │                                  │
   │  Back-End: $926 🟢              │
   └──────────────────────────────────┘
   ```

**Deal Summary (Bottom)**

```
┌──────────────────────────────────────┐
│  Total Gross Profit                  │
│                                      │
│         $14,376                      │
│         ═══════                      │
│                                      │
│  Front: $13,450 | Back: $926         │
└──────────────────────────────────────┘
```

**Mobile Interaction: The "Rust Magic"**

- Touch and drag sliders → Real-time updates
- Large numbers with haptic feedback on significant changes
- Payment Lock: Tap payment → Modal: "Lock at what amount?" → Input
- All updates < 100ms via Rust service

---

### Tab 2: 🧠 AI Coach (Mobile Version)

**Layout: Vertical Feed**

**Input Section (Top, Sticky)**

```
┌─────────────────────────────────────┐
│  Customer's Offer                   │
│                                     │
│  Payment:  [$450]  /mo             │
│  Down:     [$2,000]                │
│                                     │
│  [🧠 Get AI Strategy]               │
└─────────────────────────────────────┘
```

**AI Response Cards (Scrollable)**

```
┌─────────────────────────────────────┐
│  🤖 Analysis                        │
│  ───────────────────────────────    │
│                                     │
│  Offer is $1,150 below min.         │
│  730 FICO, 60% walk risk.           │
│  Vehicle: 58 days on lot.           │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💰 MAX PROFIT                      │
│  ───────────────────────────────    │
│                                     │
│  Payment:  $495/mo                  │
│  Down:     $2,500                   │
│  Term:     60 months                │
│                                     │
│  Close: 55% 🟡 | Profit: $2,100 🟢 │
│                                     │
│  Talking Point:                     │
│  "We're close! Just need a bit      │
│  more down to get you this truck."  │
│                                     │
│  [🚀 Stage This Deal]               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🎯 BEST CLOSE                      │
│  ───────────────────────────────    │
│                                     │
│  Payment:  $470/mo                  │
│  Down:     $2,000                   │
│  Term:     72 months                │
│                                     │
│  Close: 85% 🟢 | Profit: $1,600 🟡 │
│                                     │
│  Talking Point:                     │
│  "Can't do $450, but $470 right     │
│  now keeps your down payment."      │
│                                     │
│  [🚀 Stage This Deal]               │
└─────────────────────────────────────┘
```

**Stage This Deal Interaction (Mobile)**

When tapped:
1. Card animates with blue pulse
2. Auto-switch to Simulator tab with smooth transition
3. All sliders animate to new positions
4. Success toast appears
5. Can tap back to AI Coach to see other recommendations

---

### Action Bar (Sticky Footer)

```
┌─────────────────────────────────────┐
│                                     │
│  [📋 Paste to Chat]  [✕ Close]      │
│                                     │
└─────────────────────────────────────┘
```

**Paste to Chat Action:**

1. Tap button
2. Deal Studio slides down
3. DM chat interface returns
4. Message input now contains formatted deal:

```
┌─────────────────────────────────────┐
│  [Type a message...]                │
│  ──────────────────────────────     │
│  Great news! I can do:              │
│                                     │
│  💰 $495/month for 60 months        │
│  💵 $2,500 down payment             │
│  🚗 2024 F-150 Lariat               │
│                                     │
│  Includes warranty + GAP            │
│                                     │
│  Ready to move forward? 🎉          │
│  ──────────────────────────────     │
│                                     │
│  [💬]  [📷]  [💰 Desk]  [Send]      │
└─────────────────────────────────────┘
```

User can edit message before sending.

---

## Part 3: Custom Component Library

### Design Token System

**File: `/apps/frontend/src/design-tokens/index.ts`**

```typescript
export const designTokens = {
  // Colors
  colors: {
    // Brand
    brand: {
      primary: '#0066FF',      // Autolytiq blue
      secondary: '#7C3AED',    // Purple for AI
      accent: '#10B981',       // Green for profit
      warning: '#F59E0B',      // Yellow for caution
      danger: '#EF4444',       // Red for loss
    },

    // Backgrounds
    background: {
      default: '#FFFFFF',
      muted: '#F8FAFC',
      elevated: '#FFFFFF',
      dark: '#0F172A',
      darkMuted: '#1E293B',
    },

    // Text
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },

    // Semantic (Deal Studio specific)
    deal: {
      profitGreen: '#10B981',
      profitYellow: '#F59E0B',
      profitRed: '#EF4444',
      aiPurple: '#7C3AED',
      paymentBlue: '#0066FF',
      lockedBlue: '#0EA5E9',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // Typography
  typography: {
    fontFamily: {
      body: "'Inter', -apple-system, sans-serif",
      display: "'Inter', -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Courier New', monospace",
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      md: '1rem',         // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px - Payment display
      display: '4.5rem',  // 72px - Hero numbers
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border Radius
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',   // Pills
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(0, 102, 255, 0.3)',
  },

  // Transitions
  transitions: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },

  // Breakpoints
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
    wide: '1536px',
  },
};
```

---

### Core Components

#### 1. LivePaymentDisplay

**File: `/apps/frontend/src/components/deal-studio/LivePaymentDisplay.tsx`**

**Purpose:** Large, animated payment number - the heart of the simulator

**Props:**
```typescript
interface LivePaymentDisplayProps {
  payment: number;
  isLocked?: boolean;
  onToggleLock?: () => void;
  isCalculating?: boolean;
  term?: number;
  apr?: number;
}
```

**Design Specs:**
- Payment: `text-6xl font-bold font-mono` (60px)
- Color: Default `text-slate-900`, Locked `text-blue-600`, Red if unprofitable
- Animation: Smooth number counter, glow pulse when updating
- Lock button: Toggle with icon change
- Calculating state: Subtle pulse animation

**Usage:**
```tsx
<LivePaymentDisplay
  payment={542.10}
  isLocked={false}
  onToggleLock={() => setPaymentLocked(!paymentLocked)}
  isCalculating={isCalculatingPayment}
  term={60}
  apr={5.99}
/>
```

---

#### 2. DealSlider

**File: `/apps/frontend/src/components/deal-studio/DealSlider.tsx`**

**Purpose:** Touch-friendly slider with live value display

**Props:**
```typescript
interface DealSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  helperText?: string;
  locked?: boolean;
}
```

**Design Specs:**
- Height: 48px minimum (mobile)
- Track: `bg-slate-200` with gradient fill
- Thumb: Large (20px), blue, with shadow
- Value display: Above thumb, `font-mono text-xl`
- Labels: `text-sm text-slate-600`
- Locked state: Gray with lock icon overlay

**Usage:**
```tsx
<DealSlider
  label="Down Payment"
  value={downPayment}
  min={0}
  max={10000}
  step={100}
  onChange={setDownPayment}
  formatValue={(v) => `$${v.toLocaleString()}`}
  helperText="Suggested: $4,589"
/>
```

---

#### 3. AICoachCard

**File: `/apps/frontend/src/components/deal-studio/AICoachCard.tsx`**

**Purpose:** Display AI recommendation with "Stage This Deal" action

**Props:**
```typescript
interface AICoachCardProps {
  type: 'max_profit' | 'best_close' | 'balanced';
  recommendation: {
    payment: number;
    downPayment: number;
    term: number;
    apr: number;
    warranty?: number;
    gap?: number;
  };
  metrics: {
    closeProb: number;
    grossProfit: number;
    approvalProb: number;
  };
  talkingPoint: string;
  reasoning?: string;
  onStage: () => void;
}
```

**Design Specs:**
- Card with colored left border (4px):
  - Max Profit: Green
  - Best Close: Blue
  - Balanced: Purple
- Icon badge at top
- Two-column metrics layout
- Talking point in italic, light background
- Prominent "Stage This Deal" button
- Hover state: Slight lift with shadow

**Usage:**
```tsx
<AICoachCard
  type="max_profit"
  recommendation={{
    payment: 495,
    downPayment: 2500,
    term: 60,
    apr: 5.99,
  }}
  metrics={{
    closeProb: 0.55,
    grossProfit: 2100,
    approvalProb: 0.92,
  }}
  talkingPoint="We're close! Just need a bit more down..."
  onStage={() => stageDeal(recommendation)}
/>
```

---

#### 4. CustomerDossier

**File: `/apps/frontend/src/components/deal-studio/CustomerDossier.tsx`**

**Purpose:** Left panel showing customer context

**Props:**
```typescript
interface CustomerDossierProps {
  customerId: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
```

**Design Specs:**
- Width: 25% desktop, full-screen drawer mobile
- Background: `bg-slate-50`
- Sections: Cards with `space-y-4`
- Sticky header with collapse button
- Color-coded credit score badge
- Vehicle card with image

**Sections:**
- Customer Profile
- Financial Summary
- Vehicle Context
- Recent Activity
- Trade-In Summary

---

#### 5. DealStructureSummary

**File: `/apps/frontend/src/components/deal-studio/DealStructureSummary.tsx`**

**Purpose:** Bottom summary card showing complete deal breakdown

**Props:**
```typescript
interface DealStructureSummaryProps {
  deal: {
    vehiclePrice: number;
    downPayment: number;
    netTrade: number;
    amountFinanced: number;
    fiProducts: number;
    totalFinanced: number;
    frontEndProfit: number;
    backEndProfit: number;
    totalProfit: number;
  };
  onSave?: () => void;
  onExport?: () => void;
  onSendToCustomer?: () => void;
}
```

**Design Specs:**
- Card with subtle border
- Two-column layout: Labels left, values right
- Profit metrics: Large, bold, color-coded
- Divider between financing and profit sections
- Action buttons at bottom

---

#### 6. FIProductSelector

**File: `/apps/frontend/src/components/deal-studio/FIProductSelector.tsx`**

**Purpose:** Checkbox list for F&I products with profit calculation

**Props:**
```typescript
interface FIProductSelectorProps {
  products: Array<{
    id: string;
    name: string;
    retailPrice: number;
    cost: number;
    selected: boolean;
  }>;
  onChange: (productId: string, selected: boolean) => void;
}
```

**Design Specs:**
- Large checkboxes (24px)
- Product name + retail price
- Profit shown in green: `(+$xxx)`
- Total back-end profit at bottom
- Responsive: Stack on mobile

---

#### 7. PaymentLockModal (Mobile)

**File: `/apps/frontend/src/components/deal-studio/PaymentLockModal.tsx`**

**Purpose:** Modal to input target payment when locking

**Props:**
```typescript
interface PaymentLockModalProps {
  currentPayment: number;
  onLock: (targetPayment: number) => void;
  onCancel: () => void;
}
```

**Design Specs:**
- Bottom sheet on mobile
- Large number input with dollar sign
- "Lock" button (primary) and "Cancel" button
- Helper text: "Other levers will adjust automatically"

---

#### 8. TabControl (Mobile)

**File: `/apps/frontend/src/components/deal-studio/TabControl.tsx`**

**Purpose:** Segmented control for Simulator / AI Coach tabs

**Props:**
```typescript
interface TabControlProps {
  activeTab: 'simulator' | 'ai-coach';
  onChange: (tab: 'simulator' | 'ai-coach') => void;
}
```

**Design Specs:**
- Full-width segmented control
- Icon + label for each tab
- Smooth sliding indicator
- Active tab: Bold, blue
- Inactive tab: Gray

---

#### 9. CompactDossierHeader (Mobile)

**File: `/apps/frontend/src/components/deal-studio/CompactDossierHeader.tsx`**

**Purpose:** Sticky header showing key customer/vehicle info

**Props:**
```typescript
interface CompactDossierHeaderProps {
  customerName: string;
  creditScore: number;
  vehicleName: string;
  vehiclePrice: number;
  daysOnLot: number;
  onExpandDetails: () => void;
}
```

**Design Specs:**
- Two lines: Customer + Vehicle
- FICO badge with color coding
- Info icon button
- Background: White with bottom shadow

---

#### 10. DealStudioModal (Mobile)

**File: `/apps/frontend/src/components/deal-studio/DealStudioModal.tsx`**

**Purpose:** Full-screen mobile modal container

**Props:**
```typescript
interface DealStudioModalProps {
  open: boolean;
  onClose: () => void;
  dealId?: string;
  customerId: string;
  vehicleId: string;
  children: React.ReactNode;
}
```

**Design Specs:**
- Full-screen overlay
- Slide up animation from bottom
- Drag handle at top
- Can swipe down to dismiss
- Prevents background scroll

---

### Specialized Utility Components

#### 11. ProfitBadge

**Purpose:** Color-coded badge for profit metrics

**Props:**
```typescript
interface ProfitBadgeProps {
  amount: number;
  threshold?: { min: number; target: number };
  size?: 'sm' | 'md' | 'lg';
}
```

**Colors:**
- Green: Above target
- Yellow: Between min and target
- Red: Below min

---

#### 12. ProbabilityIndicator

**Purpose:** Visual indicator for percentages (close prob, approval prob)

**Props:**
```typescript
interface ProbabilityIndicatorProps {
  probability: number; // 0-1
  label: string;
  showPercentage?: boolean;
}
```

**Design:**
- Progress bar with gradient fill
- Percentage text
- Color-coded: Green (>70%), Yellow (50-70%), Red (<50%)

---

#### 13. DealTimeline

**Purpose:** Show deal progression stages

**Props:**
```typescript
interface DealTimelineProps {
  stages: Array<{
    name: string;
    status: 'completed' | 'current' | 'pending';
    timestamp?: Date;
  }>;
}
```

---

## Part 4: Architecture & Data Flow

### Desktop Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DealStudioContainer                      │
│  (State management, Rust/ML service orchestration)          │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
    │  Customer   │ │   Live    │ │     AI      │
    │  Dossier    │ │ Simulator │ │ Companion   │
    │  (Panel 1)  │ │ (Panel 2) │ │  (Panel 3)  │
    └──────┬──────┘ └─────┬─────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                ┌──────────▼──────────┐
                │   Shared State      │
                │   (Zustand Store)   │
                └─────────────────────┘
```

### Mobile Architecture

```
┌─────────────────────────────────────────┐
│         DM Chat Interface               │
│  (Home base, launches Deal Studio)      │
└─────────────────────────────────────────┘
                    │
              [Tap Desk Icon]
                    │
                    ▼
┌─────────────────────────────────────────┐
│     DealStudioModal (Full-screen)       │
│  ┌────────────────────────────────┐     │
│  │  CompactDossierHeader          │     │
│  ├────────────────────────────────┤     │
│  │  TabControl                    │     │
│  │  [Simulator] [AI Coach]        │     │
│  ├────────────────────────────────┤     │
│  │  Active Tab Content            │     │
│  │  (Scrollable)                  │     │
│  ├────────────────────────────────┤     │
│  │  ActionBar                     │     │
│  │  [Paste] [Close]               │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### Data Flow: Real-Time Calculation Loop

```
User adjusts slider
     │
     ▼
Update local state (optimistic)
     │
     ▼
Debounce 50ms (prevent spam)
     │
     ▼
Call Rust Pricing Service (gRPC)
{
  vehiclePrice: 45900,
  downPayment: 3500,
  netTrade: 3500,
  term: 60,
  apr: 5.99,
  addOns: 3090
}
     │
     ▼
Rust calculates (< 100ms)
{
  monthlyPayment: 542.10,
  totalFinanced: 42890,
  totalInterest: 8636,
  totalCost: 51526
}
     │
     ▼
Update UI state
     │
     ▼
Animate payment display
     │
     ▼
Update deal summary
     │
     ▼
Trigger AI re-evaluation (debounced 2s)
```

### Data Flow: AI Recommendation

```
User enters customer offer
     │
     ▼
Gather context:
- Customer data (from CRM)
- Vehicle data (from Inventory)
- Current deal structure
- Historical data
     │
     ▼
Call ML Service (POST /api/ml/optimize-deal)
{
  customer: { creditScore: 730, ... },
  vehicle: { cost: 32450, daysOnLot: 58, ... },
  currentStructure: { salePrice: 45900, ... },
  customerOffer: { payment: 450, downPayment: 2000 }
}
     │
     ▼
ML service analyzes (< 500ms)
- Evaluates ~2000 deal structures
- Calculates close probability for each
- Identifies optimal strategies
     │
     ▼
Return recommendations
{
  recommendations: [
    { type: 'max_profit', ... },
    { type: 'best_close', ... },
    { type: 'balanced', ... }
  ],
  warnings: [...],
  metadata: { confidence: 'high' }
}
     │
     ▼
Render AICoachCard components
     │
     ▼
User clicks "Stage This Deal"
     │
     ▼
Update simulator state with AI values
     │
     ▼
Animate all sliders to new positions
     │
     ▼
Trigger Rust recalculation
```

### Data Flow: Payment Lock Feature

```
User locks payment at $500
     │
     ▼
Set paymentLocked = true
Set targetPayment = 500
     │
     ▼
User adjusts Down Payment slider (+$500)
     │
     ▼
Calculate required price adjustment:
newAmountFinanced = calculateFinancedAmount(
  targetPayment: 500,
  term: 60,
  apr: 5.99
)
     │
     ▼
Calculate new vehicle price:
newPrice = newAmountFinanced + newDownPayment + netTrade - addOns
     │
     ▼
Update vehiclePrice state
     │
     ▼
Animate vehicle price slider to new position
     │
     ▼
Payment remains at $500 (locked)
```

---

## Part 5: Integration Points

### Rust Pricing Service (Port 50051)

**gRPC Service Definition:**

```protobuf
service PriceEngine {
  rpc CalculatePayment (PaymentRequest) returns (PaymentResponse);
  rpc CalculateWithLock (LockedPaymentRequest) returns (LockedPaymentResponse);
  rpc StreamPricing (StreamRequest) returns (stream PricingUpdate);
}

message PaymentRequest {
  double vehicle_price = 1;
  double down_payment = 2;
  double net_trade = 3;
  int32 term_months = 4;
  double apr = 5;
  double add_ons = 6;
}

message PaymentResponse {
  double monthly_payment = 1;
  double total_financed = 2;
  double total_interest = 3;
  double total_cost = 4;
  int32 calculation_time_us = 5;
}

message LockedPaymentRequest {
  double target_payment = 1;
  double down_payment = 2;
  double net_trade = 3;
  int32 term_months = 4;
  double apr = 5;
  double add_ons = 6;
  double min_vehicle_price = 7;
  double max_vehicle_price = 8;
}

message LockedPaymentResponse {
  double required_vehicle_price = 1;
  double monthly_payment = 2;
  bool feasible = 3;
  string reason = 4;
}
```

**Frontend Integration:**

```typescript
// apps/frontend/src/lib/rustPricingService.ts

import { PriceEngineClient } from '@/generated/price-engine-grpc-web';

const client = new PriceEngineClient('http://localhost:50051');

export async function calculatePayment(request: PaymentRequest) {
  const response = await client.calculatePayment(request);
  return response;
}

export async function calculateWithPaymentLock(request: LockedPaymentRequest) {
  const response = await client.calculateWithLock(request);
  return response;
}

// WebSocket for live updates
export function subscribeToLivePricing(dealId: string, callback: (update: PricingUpdate) => void) {
  const stream = client.streamPricing({ dealId });
  stream.on('data', callback);
  return () => stream.cancel();
}
```

---

### ML Service (Port 8000)

**REST API Endpoints:**

```
POST /api/ml/optimize-deal
POST /api/ml/predict-close-probability
POST /api/ml/predict-approval-probability
POST /api/ml/analyze-customer-offer
POST /api/ml/get-similar-deals
```

**Request/Response Types:**

```typescript
// apps/frontend/src/lib/mlService.ts

export interface OptimizeDealRequest {
  customer: {
    id: string;
    creditScore: number;
    annualIncome?: number;
    monthlyDebt?: number;
  };
  vehicle: {
    id: string;
    cost: number;
    msrp: number;
    daysOnLot: number;
    marketPrice: number;
  };
  currentStructure: {
    salePrice: number;
    downPayment: number;
    tradeValue: number;
    tradePayoff: number;
    term: number;
    apr: number;
    warranty?: number;
    gap?: number;
    maintenance?: number;
  };
  customerOffer?: {
    payment: number;
    downPayment: number;
    term?: number;
  };
  constraints?: {
    minGrossProfit: number;
    maxLTV: number;
    maxPayment?: number;
  };
}

export interface OptimizeDealResponse {
  recommendations: Array<{
    type: 'max_profit' | 'best_close' | 'balanced';
    structure: DealStructure;
    metrics: {
      monthlyPayment: number;
      grossProfit: number;
      frontEndProfit: number;
      backEndProfit: number;
      closeProb: number;
      approvalProb: number;
      dealCloseProb: number;
    };
    talkingPoint: string;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
  analysis: {
    customerOfferGap: number;
    riskFactors: string[];
    opportunities: string[];
  };
  warnings: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
  }>;
  metadata: {
    structuresEvaluated: number;
    executionTimeMs: number;
    modelVersion: string;
  };
}
```

---

### CRM Integration

**Data Required:**
- Customer profile
- Credit score
- Financial summary
- Recent interactions
- Communication history
- Previous deals

**API Endpoints:**
```
GET /api/customers/:id
GET /api/customers/:id/financial-summary
GET /api/customers/:id/interactions
GET /api/customers/:id/deals
```

---

### DMS/Inventory Integration

**Data Required:**
- Vehicle details
- Cost and pricing
- Days on lot
- Accounting history
- Market pricing
- Similar vehicles

**API Endpoints:**
```
GET /api/vehicles/:id
GET /api/vehicles/:id/accounting
GET /api/vehicles/:id/market-pricing
GET /api/vehicles/:id/similar
```

---

### Chat/DM Integration (Mobile)

**Data Flow:**
```
DM Chat Interface
     │
     ▼
Launch Deal Studio
     │
     ▼
Work on deal structure
     │
     ▼
Tap "Paste to Chat"
     │
     ▼
Format deal summary
     │
     ▼
Insert into DM input
     │
     ▼
Send to customer
```

**API Endpoints:**
```
POST /api/messages/format-deal
POST /api/messages/send
GET /api/messages/conversation/:customerId
```

---

## Part 6: User Experience Flows

### Flow 1: New Deal from Scratch (Desktop)

1. **Launch Deal Studio**
   - From Dashboard: Click "New Deal" button
   - From Inventory: Click "Desk This Vehicle"
   - From Customer Profile: Click "Start Deal"
   - Opens full-screen Deal Studio

2. **Select Customer** (Panel 1)
   - Click "Select Customer" in dossier
   - Search/select customer
   - Dossier populates with data

3. **Select Vehicle** (Panel 1)
   - Click "Select Vehicle"
   - Choose from inventory
   - Vehicle card shows cost, pricing, days on lot

4. **Set Initial Structure** (Panel 2)
   - Sliders default to MSRP, suggested down, 60-month term
   - Payment displays immediately
   - Adjust sliders to explore options

5. **Get AI Recommendations** (Panel 3)
   - AI automatically analyzes deal
   - Three strategies appear
   - Review talking points

6. **Refine Deal**
   - Click "Stage This Deal" on Best Close strategy
   - Sliders animate to AI-suggested values
   - Further adjust as needed

7. **Save Deal**
   - Click "Save Deal" in summary
   - Deal saved to CRM
   - Can export PDF or send to customer

**Time: ~3 minutes**

---

### Flow 2: Counter-Offer Response (Mobile)

1. **Receive Customer Offer**
   - In DM: "Can you do $450/month?"
   - Salesperson reads message

2. **Launch Deal Studio**
   - Tap `[💰 Desk]` icon in chat bar
   - Full-screen modal slides up
   - Compact dossier shows customer + vehicle

3. **Input Customer Offer** (AI Coach Tab)
   - Default tab: AI Coach
   - Enter: Payment $450, Down $2,000
   - Tap "Get AI Strategy"

4. **Review AI Recommendations**
   - 3 cards appear with strategies
   - Review close probabilities and profits
   - Choose "Best Close" strategy (85% close, $1,600 profit)

5. **Stage and Review** (Simulator Tab)
   - Tap "Stage This Deal"
   - Auto-switch to Simulator tab
   - Sliders animate to recommended values
   - Payment shows $470/month
   - Review deal structure

6. **Paste to Chat**
   - Tap "Paste to Chat" in footer
   - Deal Studio closes
   - DM input now has formatted message:
     ```
     Great news! I can do:
     💰 $470/month for 72 months
     💵 $2,000 down payment
     🚗 2024 F-150 Lariat
     Ready to move forward? 🎉
     ```

7. **Send to Customer**
   - Edit message if needed
   - Tap "Send"
   - Await response

**Time: ~2 minutes**

---

### Flow 3: Payment Lock Exploration (Desktop)

1. **Customer Sets Budget**
   - "I can only do $500/month max"
   - Salesperson needs to find a deal that works

2. **Lock Payment** (Panel 2)
   - Click 🔒 next to payment display
   - Enter target: $500
   - Payment display turns blue, shows lock icon

3. **Adjust Variables**
   - Move Down Payment slider UP to $4,000
   - Vehicle Price slider automatically moves DOWN to $43,200
   - Payment stays at $500

4. **Try Different Term**
   - Switch from 60 to 72 months
   - Vehicle Price slider adjusts UP (can afford higher price with longer term)
   - Payment stays at $500

5. **Add F&I Products**
   - Check Warranty (+$2,495)
   - Vehicle Price slider adjusts DOWN slightly
   - Payment stays at $500

6. **Find Profitable Structure**
   - Explore various combinations
   - Monitor profit meter
   - Find: $500/mo, $4,500 down, 72 months, warranty + GAP
   - Profit: $2,200 (acceptable)

7. **Unlock and Present**
   - Click 🔓 to unlock payment
   - Review full deal
   - Present to customer

**Time: ~5 minutes**

---

## Part 7: File Structure

```
apps/frontend/src/
├── components/
│   ├── deal-studio/
│   │   ├── desktop/
│   │   │   ├── DealStudioDesktop.tsx          # Main desktop container
│   │   │   ├── CustomerDossierPanel.tsx       # Panel 1
│   │   │   ├── LiveSimulatorPanel.tsx         # Panel 2
│   │   │   └── AICompanionPanel.tsx           # Panel 3
│   │   │
│   │   ├── mobile/
│   │   │   ├── DealStudioMobile.tsx           # Main mobile container
│   │   │   ├── DealStudioModal.tsx            # Full-screen modal
│   │   │   ├── CompactDossierHeader.tsx       # Sticky header
│   │   │   ├── TabControl.tsx                 # Tab switcher
│   │   │   ├── SimulatorTab.tsx               # Simulator content
│   │   │   ├── AICoachTab.tsx                 # AI Coach content
│   │   │   └── ActionBar.tsx                  # Footer buttons
│   │   │
│   │   ├── shared/
│   │   │   ├── LivePaymentDisplay.tsx         # Payment number display
│   │   │   ├── DealSlider.tsx                 # Slider component
│   │   │   ├── AICoachCard.tsx                # AI recommendation card
│   │   │   ├── DealStructureSummary.tsx       # Deal breakdown
│   │   │   ├── FIProductSelector.tsx          # F&I products list
│   │   │   ├── ProfitMeter.tsx                # Profit gauge
│   │   │   ├── PaymentLockModal.tsx           # Lock payment modal
│   │   │   ├── CustomerDossier.tsx            # Customer info card
│   │   │   ├── VehicleContextCard.tsx         # Vehicle info card
│   │   │   ├── ProfitBadge.tsx                # Color-coded badge
│   │   │   ├── ProbabilityIndicator.tsx       # Progress bar
│   │   │   └── DealTimeline.tsx               # Stage progress
│   │   │
│   │   └── DealStudio.tsx                     # Smart wrapper (responsive)
│   │
│   └── ... (other components)
│
├── contexts/
│   └── DealStudioContext.tsx                   # Global state for Deal Studio
│
├── hooks/
│   ├── useDealCalculation.ts                   # Hook for Rust service
│   ├── useAIRecommendations.ts                 # Hook for ML service
│   ├── usePaymentLock.ts                       # Payment lock logic
│   └── useDealStudio.ts                        # Main Deal Studio hook
│
├── lib/
│   ├── rustPricingService.ts                   # Rust gRPC client
│   ├── mlService.ts                            # ML REST client
│   ├── dealCalculations.ts                     # Helper functions
│   └── dealFormatters.ts                       # Formatting utilities
│
├── design-tokens/
│   ├── index.ts                                # All design tokens
│   ├── colors.ts                               # Color definitions
│   ├── typography.ts                           # Font definitions
│   └── spacing.ts                              # Spacing scale
│
├── stores/
│   └── dealStudioStore.ts                      # Zustand store
│
├── pages/
│   ├── deal-studio.tsx                         # Standalone page
│   └── demo-deal-studio.tsx                    # Demo page
│
└── types/
    └── deal-studio.ts                          # TypeScript interfaces
```

---

## Part 8: Performance Requirements

### Speed Targets

| Operation | Target | Critical |
|-----------|--------|----------|
| Rust payment calculation | < 100ms | ✅ Essential |
| AI recommendation | < 500ms | ⚠️ Important |
| Slider input response | < 16ms | ✅ Essential |
| Panel switch (mobile) | < 200ms | ⚠️ Important |
| Stage deal animation | < 300ms | 💡 Nice-to-have |
| WebSocket latency | < 50ms | 💡 Nice-to-have |

### Optimization Strategies

1. **Debouncing:**
   - Slider inputs: Debounce Rust calls by 50ms
   - AI re-evaluation: Debounce by 2 seconds
   - Prevents service spam

2. **Optimistic UI Updates:**
   - Update sliders immediately (don't wait for Rust)
   - Show calculating indicator
   - Replace with actual value when ready

3. **React Performance:**
   - `useMemo` for expensive calculations
   - `useCallback` for slider handlers
   - `React.memo` for static components (dossier)
   - Virtual scrolling for AI feed (if > 20 cards)

4. **Code Splitting:**
   - Lazy load Deal Studio (not needed on every page)
   - Separate bundle for desktop vs mobile
   - Load AI components only when tab active

5. **Data Caching:**
   - TanStack Query for customer/vehicle data
   - Cache Rust responses for identical inputs (Map with key)
   - Invalidate on deal structure change

---

## Part 9: Responsive Breakpoints

### Desktop (≥ 1024px)

- Three-panel layout
- Panels: 25% / 50% / 25%
- Panel 1 collapsible to icon bar
- Panel 3 expandable to 50%
- All features visible at once

### Laptop (768px - 1023px)

- Three-panel layout (tighter spacing)
- Panels: 20% / 55% / 25%
- Smaller fonts and padding
- Collapsible panels recommended

### Tablet (640px - 767px)

- Switch to mobile layout
- Full-screen modal
- Tabbed interface
- Dossier in drawer

### Mobile (< 640px)

- Full mobile experience
- Launched from DM chat
- Optimized for touch
- Large hit targets

---

## Part 10: Accessibility

### Keyboard Navigation

- All sliders accessible via arrow keys
- Tab order: Payment → Sliders → F&I → Actions
- Escape key closes mobile modal
- Enter key on "Stage This Deal" applies recommendation

### Screen Readers

- ARIA labels for all interactive elements
- Live region for payment display updates
- Semantic HTML structure
- Alt text for icons

### Color Contrast

- All text meets WCAG AA standards
- Profit colors: Green, Yellow, Red (+ icons for colorblind users)
- High contrast mode support

### Touch Targets

- Minimum 48px height (mobile)
- Minimum 44px (desktop)
- Adequate spacing between interactive elements

---

## Part 11: Testing Strategy

### Unit Tests

- Rust calculation logic
- Payment lock calculations
- Deal structure validation
- Profit margin calculations
- AI response parsing

### Integration Tests

- Rust service communication
- ML service communication
- Real-time updates
- State management

### E2E Tests (Playwright)

**Desktop Flow:**
```typescript
test('Desktop: Complete deal workflow', async ({ page }) => {
  await page.goto('/deal-studio');

  // Select customer and vehicle
  await page.click('[data-testid="select-customer"]');
  await page.click('[data-testid="customer-jane-doe"]');

  // Adjust sliders
  await page.locator('[data-testid="down-payment-slider"]').fill('3500');

  // Verify payment updates
  await expect(page.locator('[data-testid="payment-display"]')).toContainText('$542');

  // Get AI recommendations
  await page.click('[data-testid="get-ai-strategy"]');
  await expect(page.locator('[data-testid="ai-card-max-profit"]')).toBeVisible();

  // Stage deal
  await page.click('[data-testid="stage-max-profit"]');
  await expect(page.locator('[data-testid="down-payment-slider"]')).toHaveValue('2500');

  // Save deal
  await page.click('[data-testid="save-deal"]');
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
});
```

**Mobile Flow:**
```typescript
test('Mobile: Launch from DM and paste to chat', async ({ page }) => {
  await page.goto('/messages/customer-123');

  // Launch Deal Studio
  await page.click('[data-testid="desk-icon"]');
  await expect(page.locator('[data-testid="deal-studio-modal"]')).toBeVisible();

  // Enter customer offer
  await page.fill('[data-testid="customer-payment-offer"]', '450');
  await page.click('[data-testid="get-ai-strategy"]');

  // Stage best close
  await page.click('[data-testid="stage-best-close"]');

  // Switch to simulator tab
  await expect(page.locator('[data-testid="simulator-tab"]')).toHaveClass(/active/);

  // Paste to chat
  await page.click('[data-testid="paste-to-chat"]');
  await expect(page.locator('[data-testid="message-input"]')).toContainText('$470');
});
```

### Performance Tests

- Measure Rust response times
- Measure AI response times
- Monitor slider input lag
- Test with 100 concurrent users

### User Acceptance Testing

- Salespeople complete 10 deals each
- Measure time to close
- Collect feedback on UX
- Track AI recommendation adoption rate

---

## Part 12: Launch Plan

### Phase 1: Core Build (Weeks 1-3)

**Week 1:**
- Design token system
- Core components (LivePaymentDisplay, DealSlider)
- Desktop three-panel layout shell

**Week 2:**
- Rust service integration
- Real-time payment calculation
- Panel 2 (Simulator) complete

**Week 3:**
- ML service integration
- AI recommendation cards
- Panel 3 (AI Companion) complete

### Phase 2: Mobile & Polish (Weeks 4-5)

**Week 4:**
- Mobile layout
- Tabbed interface
- DM chat integration
- "Paste to Chat" feature

**Week 5:**
- Payment Lock feature
- Stage This Deal animation
- Final polish and animations

### Phase 3: Testing & Refinement (Week 6)

- E2E testing
- Performance optimization
- User acceptance testing
- Bug fixes

### Phase 4: Deployment (Week 7)

- Beta rollout to 5 salespeople
- Monitor usage and performance
- Gather feedback
- Iterate

### Phase 5: Full Launch (Week 8)

- Roll out to all users
- Training materials
- Documentation
- Support

---

## Part 13: Success Metrics

### Usage Metrics

- % of deals using Deal Studio vs. old tool
- Average time spent in Deal Studio per deal
- Deals closed per day (before vs. after)
- AI recommendation adoption rate

### Performance Metrics

- Rust calculation response time (avg, p95, p99)
- ML recommendation response time
- Slider input lag
- Mobile vs. desktop usage ratio

### Business Metrics

- Average gross profit per deal (before vs. after)
- Close rate (before vs. after)
- % of deals meeting profit minimum
- Customer satisfaction scores

### Target Improvements

- 30% faster deal structuring
- 20% higher close rate
- 15% higher average gross profit
- 90%+ user satisfaction

---

## Summary

The **Autolytiq Deal Studio** transforms deal desking from a static form into a **live, intelligent cockpit**. By combining:

- **Rust-powered instant calculations** (< 100ms)
- **AI-powered strategic guidance** (proactive recommendations)
- **Payment Lock feature** (simulate deal structures)
- **Stage This Deal** (one-click apply AI suggestions)
- **Seamless DM integration** (mobile-first flow)
- **Unified three-panel desktop** (all context visible)

...we create a tool that feels **alive**, **intelligent**, and **fast**.

This is not a calculator. **This is a cockpit.**

---

**Status:** Design plan complete. Ready for implementation.

**Next Steps:**
1. Review and approve design plan
2. Set up project structure
3. Begin Phase 1: Core Build
4. Iterate based on feedback

**Questions to Resolve Before Build:**
1. Preferred state management: Zustand or React Context?
2. gRPC-web or HTTP bridge for Rust service?
3. Mobile-first or desktop-first development?
4. Beta testers identified?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-04
**Author:** Claude (Anthropic)
**Project:** Autolytiq Deal Studio
